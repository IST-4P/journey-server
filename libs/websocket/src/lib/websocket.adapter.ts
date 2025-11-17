import { AccessTokenPayload } from '@hacmieu-journey/nestjs';
import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { parse } from 'cookie';
import { createClient } from 'redis';
import { Server, ServerOptions, Socket } from 'socket.io';
import { generateRoomUserId } from './helpers';

export class WebsocketAdapter extends IoAdapter {
  private adapterConstructor?: ReturnType<typeof createAdapter>;
  private server?: Server;
  private configService: ConfigService;
  private jwtService: JwtService;

  constructor(app: INestApplicationContext) {
    super(app);
    this.configService = app.get(ConfigService);
    this.jwtService = app.get(JwtService);
  }

  async connectToRedis(): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (!redisUrl) {
      console.warn(
        '⚠️  REDIS_URL not configured. WebSocket will work without Redis adapter.'
      );
      return;
    }

    try {
      const pubClient = createClient({ url: redisUrl });
      const subClient = pubClient.duplicate();

      pubClient.on('error', (err) =>
        console.error('❌ Lỗi Redis PubClient:', err)
      );
      subClient.on('error', (err) =>
        console.error('❌ Lỗi Redis SubClient:', err)
      );

      await Promise.all([pubClient.connect(), subClient.connect()]);

      this.adapterConstructor = createAdapter(pubClient, subClient);
      console.log('✅ Redis adapter connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect Redis adapter:', error);
    }
  }

  override createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: true,
        credentials: true,
      },
    }) as unknown as Server;

    this.server = server;

    // Apply Redis adapter if available
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }

    // Apply authentication middleware to all namespaces
    server.of(/.*/).use((socket, next) => {
      void this.authMiddleware(socket, next);
    });

    // Apply admin role middleware to specific namespaces
    server.of('/chat-list').use((socket, next) => {
      void this.adminRoleMiddleware(socket, next);
    });

    server.of('/complaint-list').use((socket, next) => {
      void this.adminRoleMiddleware(socket, next);
    });

    return server;
  }

  emitToUser(userId: string, event: string, data: unknown) {
    if (!this.server) return;
    const room = generateRoomUserId(userId);
    this.server.to(room).emit(event, data);
  }

  /**
   * WebSocket Authentication Middleware
   * Xác thực JWT token từ:
   * - Authorization header (Bearer token)
   * - Cookie (accessToken)
   *
   * Tương tự như JwtStrategy trong HTTP requests
   */
  async authMiddleware(socket: Socket, next: (err?: any) => void) {
    const { authorization, cookie: cookieHeader } = socket.handshake.headers;

    let accessToken: string | undefined;

    // Extract token from Authorization header
    if (authorization?.startsWith('Bearer ')) {
      accessToken = authorization.split(' ')[1];
    }
    // Extract token from cookie
    else if (typeof cookieHeader === 'string') {
      const cookies = parse(cookieHeader);
      accessToken = cookies['accessToken'];
    }

    if (!accessToken) {
      return next(new Error('Missing authentication token'));
    }

    try {
      // Verify JWT token using the same secret as HTTP requests
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        accessToken,
        {
          secret: this.configService.getOrThrow('ACCESS_TOKEN_SECRET'),
        }
      );

      // Validate payload structure
      if (!payload.userId || !payload.role) {
        return next(new Error('Invalid token payload'));
      }

      // Store user info in socket data for later use
      socket.data['userId'] = payload.userId;
      socket.data['role'] = payload.role;

      // Join user to their personal room for targeted messaging
      await socket.join(generateRoomUserId(payload.userId));

      console.log(
        `✅ WebSocket authenticated: userId=${payload.userId}, role=${payload.role}`
      );

      next();
    } catch (error) {
      console.error('❌ WebSocket authentication failed:', error);
      next(new Error('Invalid or expired token'));
    }
  }

  /**
   * WebSocket Admin Role Middleware
   * Kiểm tra role ADMIN sau khi đã authenticate
   * Phải được gọi sau authMiddleware
   */
  async adminRoleMiddleware(socket: Socket, next: (err?: any) => void) {
    const role = socket.data['role'];

    if (!role) {
      return next(new Error('Missing role information'));
    }

    // Kiểm tra role ADMIN (support cả uppercase và lowercase)
    const isAdmin = role === 'ADMIN' || role === 'admin';

    if (!isAdmin) {
      console.warn(
        `⚠️  Access denied: userId=${socket.data['userId']}, role=${role}`
      );
      return next(new Error('Insufficient permissions. Admin role required'));
    }

    console.log(
      `✅ Admin role verified: userId=${socket.data['userId']}, role=${role}`
    );

    next();
  }
}

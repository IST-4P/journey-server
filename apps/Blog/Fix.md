GET /api/blog
chuyển

```
{
  "items": [
    {
      "id": "aee95932-abe1-4671-bf7a-edd1ed6ee37d",
      "title": "Simple Test",
      "content": "<p>Simple content for testing</p>",
      "region": "HCM",
      "thumbnail": "https://example.com/image.jpg"
    },
    {
      "id": "7ac8b30e-9393-4007-b7f2-f7037b947d4a",
      "title": "TÊST",
      "content": "string",
      "region": "HC<",
      "thumbnail": "https://www.youtube.com/watch?v=U37Ch4ogv8A"
    },
    {
      "id": "626c485f-79de-4fd3-95a1-adc80cc79456",
      "title": "string",
      "content": "string",
      "region": "HC<",
      "thumbnail": "https://www.youtube.com/watch?v=U37Ch4ogv8A"
    }
  ],
  "totalCount": 3,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

thành

```
{
  "blogs": [
    {
      "id": "aee95932-abe1-4671-bf7a-edd1ed6ee37d",
      "title": "Simple Test",
      "content": "<p>Simple content for testing</p>",
      "region": "HCM",
      "thumbnail": "https://example.com/image.jpg"
    },
    {
      "id": "7ac8b30e-9393-4007-b7f2-f7037b947d4a",
      "title": "TÊST",
      "content": "string",
      "region": "HC<",
      "thumbnail": "https://www.youtube.com/watch?v=U37Ch4ogv8A"
    },
    {
      "id": "626c485f-79de-4fd3-95a1-adc80cc79456",
      "title": "string",
      "content": "string",
      "region": "HC<",
      "thumbnail": "https://www.youtube.com/watch?v=U37Ch4ogv8A"
    }
  ],
  "page": 1,
  "limit": 10,
  "totalItems": 3,
  "totalPages": 1,
}
```

DELETE /api/blog/{id}
nếu delete thành công trả về

```
{
    message: "Messafe.DeleteSuccessfully"
}
```

nếu các api validate ra lỗi thì trả về Exception

```
{
    message: "Error.Invalid...",
    statusCode: statusCode,
}
```

xoá /api/blog/html

gộp GET api/blog và api/blog/search lại thành 1 thành api/blog, nếu có query thì search theo query

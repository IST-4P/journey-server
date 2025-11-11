namespace device.Model.Dto
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string LogoUrl { get; set; }

        public DateTime CreateAt { get; set; }
        public DateTime UpdateAt { get; set; }
    }

    public class CreateCategoryDto
    {
        public required string Name { get; set; }
        public required string LogoUrl { get; set; }
    }

    public class UpdateCategoryDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? LogoUrl { get; set; }
        
    }
}

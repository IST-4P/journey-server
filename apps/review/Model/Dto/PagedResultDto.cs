namespace review.Model.Dto
{
    /// <summary>
    /// Generic paged result wrapper
    /// </summary>
    public class PagedResultDto<T>
    {
        public List<T> Items { get; set; } = new();
        public int Page { get; set; }
        public int Limit { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;

        public PagedResultDto()
        {
        }

        public PagedResultDto(List<T> items, int page, int limit, int totalItems)
        {
            Items = items;
            Page = page;
            Limit = limit;
            TotalItems = totalItems;
            TotalPages = (int)Math.Ceiling((double)totalItems / limit);
        }
    }
}

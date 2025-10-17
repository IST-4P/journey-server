using System;

namespace device.Model.Dto
{
    public class DeviceQuery
    {
        // Filtering
        public string? Search { get; set; } // matches Name/Description
        public Guid? CategoryId { get; set; }
        public string? Status { get; set; }
        public double? MinPrice { get; set; }
        public double? MaxPrice { get; set; }

        // Sorting
        public string? SortBy { get; set; } // name, price, createAt, updateAt
        public string? SortDir { get; set; } // asc | desc

        // Pagination
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class PagedResult<T>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public long TotalCount { get; set; }
        public IEnumerable<T> Items { get; set; } = Array.Empty<T>();
    }
}

using System.Collections.Generic;

namespace RealtyStore.Models
{
    public class CollectionResponse<T>
    {
        public IEnumerable<T> Items { get; set; }

        public int TotalPages { get; set; }

        public int Page { get; set; }
    }
}
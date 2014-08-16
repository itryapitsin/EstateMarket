using System;
using System.Linq.Expressions;
using RealtyStore.Models.Business;

namespace RealtyStore.Infrastructure.Specifications
{
    public class AdvertTypeSpecification: Specification<Advert>
    {
        private AdvertType? _filter;

        public AdvertTypeSpecification(AdvertType? advertTypeFilter)
        {
            _filter = advertTypeFilter;
        }

        public override Expression<Func<Advert, bool>> IsSatisfied()
        {
            return advert => !_filter.HasValue || advert.AdvertType == _filter.Value;
        }
    }
}
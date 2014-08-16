using System;
using System.Linq.Expressions;
using RealtyStore.Models.Business;

namespace RealtyStore.Infrastructure.Specifications
{
    public class RealtyTypeSpecification: Specification<Advert>
    {
        private RealtyType? _filter;

        public RealtyTypeSpecification(RealtyType? filter)
        {
            _filter = filter;
        }

        public override Expression<Func<Advert, bool>> IsSatisfied()
        {
            return advert => !_filter.HasValue || advert.RealtyType == _filter.Value;
        }
    }
}
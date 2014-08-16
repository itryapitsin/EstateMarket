using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using RealtyStore.Models.Business;

namespace RealtyStore.Infrastructure.Specifications
{
    public class AdvertCostSpecification: Specification<Advert>
    {
        private double? _minCost;
        private double? _maxCost;

        public AdvertCostSpecification(double? minCost, double? maxCost)
        {
            _minCost = minCost;
            _maxCost = maxCost;
        }

        public override Expression<Func<Advert, bool>> IsSatisfied()
        {
            return advert =>
                !_minCost.HasValue || (advert.Cost >= _minCost.Value) && 
                !_maxCost.HasValue || (advert.Cost <= _maxCost.Value);

        }
    }
}
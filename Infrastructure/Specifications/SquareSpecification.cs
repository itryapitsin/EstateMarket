using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using RealtyStore.Models.Business;

namespace RealtyStore.Infrastructure.Specifications
{
    public class SquareSpecification: Specification<Advert>
    {
        private int? _min;
        private int? _max;

        public SquareSpecification(int? min, int? max)
        {
            _min = min;
            _max = max;
        }

        public override Expression<Func<Advert, bool>> IsSatisfied()
        {
            return adv => (!_min.HasValue || adv.Square >= _min.Value) &&
                          (!_max.HasValue || adv.Square <= _max.Value);
        }
    }
}
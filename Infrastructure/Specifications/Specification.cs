using System;
using System.Linq.Expressions;

namespace RealtyStore.Infrastructure.Specifications
{
    public abstract class Specification<T>
    {
        public abstract Expression<Func<T, bool>> IsSatisfied();
    }
}
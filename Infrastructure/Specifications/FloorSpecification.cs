using System;
using System.Linq.Expressions;
using RealtyStore.Models.Business;

namespace RealtyStore.Infrastructure.Specifications
{
    public class FloorSpecification: Specification<Apartment>
    {
        public FloorFilter? FloorFilter { get; private set; }

        public FloorSpecification(FloorFilter? floorFilter)
        {
            FloorFilter = floorFilter;
        }

        public override Expression<Func<Apartment, bool>> IsSatisfied()
        {
            return room =>
                !FloorFilter.HasValue ||
                !room.Floor.HasValue ||
                (FloorFilter == Models.Business.FloorFilter.NotLast
                    ? room.Floor != room.FloorCount // not last
                    : FloorFilter == Models.Business.FloorFilter.NotFirst
                        ? room.Floor != 1 // not first
                        : FloorFilter == Models.Business.FloorFilter.NotFirstAndNotLast
                            ? (room.Floor != 1) && (room.Floor != room.FloorCount) // not last and fisrt
                            : (room.Floor.HasValue || room.FloorCount.HasValue));

        }
    }
}
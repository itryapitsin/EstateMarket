using System;
using System.Linq.Expressions;
using RealtyStore.Models.Business;

namespace RealtyStore.Infrastructure.Specifications
{
    public class RoomFloorSpecification: Specification<Room>
    {
        public FloorFilterType? FloorFilter { get; private set; }

        public RoomFloorSpecification(FloorFilterType? floorFilter)
        {
            FloorFilter = floorFilter;
        }

        public override Expression<Func<Room, bool>> IsSatisfied()
        {
            return room =>
                !FloorFilter.HasValue || (FloorFilter == FloorFilterType.NotLast
                    ? room.Floor != room.FloorCount // not last
                    : FloorFilter == FloorFilterType.NotFirst
                        ? room.Floor != 1 // not first
                        : FloorFilter == FloorFilterType.NotFirstAndNotLast
                            ? (room.Floor != 1) && (room.Floor != room.FloorCount) // not last and fisrt
                            : (room.Floor.HasValue || room.FloorCount.HasValue));

        }
    }
}
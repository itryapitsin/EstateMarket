using System;
using System.Linq.Expressions;
using RealtyStore.Models.Business;

namespace RealtyStore.Infrastructure.Specifications
{
    public class RoomFloorCountSpecification: Specification<Room>
    {
        private FloorCountFilter? _floorCountFilter;
        public RoomFloorCountSpecification(FloorCountFilter? floorCountFilter)
        {
            _floorCountFilter = floorCountFilter;
        }
        public override Expression<Func<Room, bool>> IsSatisfied()
        {
            return room => !_floorCountFilter.HasValue ||
                           (_floorCountFilter.Value == FloorCountFilter.LessThat5
                               ? room.FloorCount < 5
                               : _floorCountFilter.Value == FloorCountFilter.From5To8
                                   ? room.FloorCount >= 5 && room.FloorCount <= 8
                                   : _floorCountFilter.Value == FloorCountFilter.From9To12
                                       ? room.FloorCount >= 9 && room.FloorCount <= 12
                                       : _floorCountFilter.Value == FloorCountFilter.From13To16
                                           ? room.FloorCount >= 13 && room.FloorCount <= 16
                                           : _floorCountFilter.Value == FloorCountFilter.From17To25
                                               ? room.FloorCount >= 17 && room.FloorCount <= 25
                                               : _floorCountFilter.Value != FloorCountFilter.MoreThat25 || room.FloorCount >= 25);

        }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using RealtyStore.Models.Business;

namespace RealtyStore.Infrastructure.Specifications
{
    public class RoomCountSpecification: Specification<Room>
    {
        private RoomsCountType? _roomCountFilter;

        public RoomCountSpecification(RoomsCountType? roomCount)
        {
            _roomCountFilter = roomCount;
        }

        public override Expression<Func<Room, bool>> IsSatisfied()
        {
            return room => !_roomCountFilter.HasValue ||
                (_roomCountFilter == RoomsCountType.MoreThatNine 
                    ? room.Rooms >= _roomCountFilter
                    : room.Rooms == _roomCountFilter);
        }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using RealtyStore.Models.Business;

namespace RealtyStore.Infrastructure.Specifications
{
    public class RoomCountSpecification : Specification<Apartment>
    {
        private RoomsCountType? _roomCountFilter;

        public RoomCountSpecification(RoomsCountType? roomCount)
        {
            _roomCountFilter = roomCount;
        }

        public override Expression<Func<Apartment, bool>> IsSatisfied()
        {
            return room => !_roomCountFilter.HasValue ||
                !room.Rooms.HasValue ||
                (_roomCountFilter == RoomsCountType.MoreThatNine 
                    ? room.Rooms >= _roomCountFilter
                    : room.Rooms == _roomCountFilter);
        }
    }
}
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
        private int? _roomCountFilter;

        public RoomCountSpecification(int? roomCount)
        {
            _roomCountFilter = roomCount;
        }

        public override Expression<Func<Room, bool>> IsSatisfied()
        {
            return room => !_roomCountFilter.HasValue || 
                (_roomCountFilter.Value == 9 
                ? room.RoomCount >= _roomCountFilter.Value
                : room.RoomCount == _roomCountFilter.Value);
        }
    }
}
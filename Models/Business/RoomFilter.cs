using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RealtyStore.Models.Business
{
    public class Filter
    {
        public static Func<Room, FloorFilterType, bool> CheckFloor = (room, filter) =>
        {
            if (!room.Floor.HasValue)
                return true;

            if (!room.FloorCount.HasValue)
                return true;

            if ((room.Floor == room.FloorCount) && (filter == FloorFilterType.NotLast))
                return false;

            if ((room.Floor == 1) && (filter == FloorFilterType.NotFirst))
                return false;

            if (((room.Floor == 1) || (room.Floor == room.FloorCount)) && (filter == FloorFilterType.NotFirstAndNotLast))
                return false;

            return true;
        };
    }
}
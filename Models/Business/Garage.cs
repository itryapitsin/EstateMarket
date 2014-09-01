using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RealtyStore.Models.Business
{
    public class Garage: TypedObject
    {
        public bool? HasSecurity { get; set; }

        public Garage()
        {
            RealtyType = RealtyType.Garage;
        }
    }
}
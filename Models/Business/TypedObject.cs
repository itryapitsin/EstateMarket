using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RealtyStore.Models.Business
{
    public abstract class TypedObject: Advert
    {
        public ObjectType? ObjectType { get; set; }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using RealtyStore.Models.Business;

namespace RealtyStore.Infrastructure.Specifications
{
    public class ObjectTypeSpecification: Specification<TypedObject>
    {
        private ObjectType? _objectType;

        public ObjectTypeSpecification(ObjectType? objectType)
        {
            _objectType = objectType;
        }

        public override Expression<Func<TypedObject, bool>> IsSatisfied()
        {
            return obj => !_objectType.HasValue || !obj.ObjectType.HasValue || obj.ObjectType == _objectType.Value;
        }
    }
}
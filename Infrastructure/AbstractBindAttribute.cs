using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Mvc;

namespace RealtyStore.Infrastructure
{

    public class AbstractBindAttribute : CustomModelBinderAttribute
    {
        public string ConcreteTypeParameter { get; set; }
        public string Path { get; set; }

        public override IModelBinder GetBinder()
        {
            return new AbstractModelBinder(ConcreteTypeParameter, Path);
        }

        private class AbstractModelBinder : DefaultModelBinder
        {
            private readonly string _concreteTypeParameterName;
            private readonly string _path;

            public AbstractModelBinder(string concreteTypeParameterName, string path)
            {
                _concreteTypeParameterName = concreteTypeParameterName;
                _path = path;
            }

            protected override object CreateModel(ControllerContext controllerContext, ModelBindingContext bindingContext, Type modelType)
            {
                var concreteTypeValue = bindingContext.ValueProvider.GetValue(_concreteTypeParameterName);

                if (concreteTypeValue == null)
                    throw new Exception("Concrete type value not specified for abstract class binding");

                var concreteType = Assembly.GetExecutingAssembly().GetType(_path + "." + concreteTypeValue.AttemptedValue.FirstCharToUpper());
                if (concreteType == null)
                    throw new Exception("Cannot create abstract model");

                if (!concreteType.IsSubclassOf(modelType))
                    throw new Exception("Incorrect model type specified");

                var concreteInstance = Activator.CreateInstance(concreteType);

                bindingContext.ModelMetadata = ModelMetadataProviders.Current.GetMetadataForType(() => concreteInstance, concreteType);

                return concreteInstance;
            }
        }
    }
}
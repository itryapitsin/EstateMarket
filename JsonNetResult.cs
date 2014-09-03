using System;
using System.Diagnostics;
using System.Web.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;

namespace RealtyStore
{
    public class JsonNetResult : JsonResult
    {
        public static readonly JsonSerializerSettings JsonSerializerSettings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            Converters = new JsonConverter[] { new IsoDateTimeConverter(), new StringEnumConverter { CamelCaseText = true }, },
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            TypeNameHandling = TypeNameHandling.None,
            Formatting = Formatting.None,
            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
        };

        /// <summary>
        /// 
        /// </summary>
        public JsonNetResult() { }

        public JsonNetResult(object data)
            : this()
        {
            Data = data;
        }

        public JsonNetResult(object data, JsonRequestBehavior jsonRequestBehavior)
            : this()
        {
            Data = data;
            JsonRequestBehavior = jsonRequestBehavior;
        }

        public override void ExecuteResult(ControllerContext context)
        {
            // verify we have a contrex
            if (context == null)
                throw new ArgumentNullException("context");

            // get the current http context response
            var response = context.HttpContext.Response;
            // set content type of response
            response.ContentType = !String.IsNullOrEmpty(ContentType) ? ContentType : "application/json";
            // set content encoding of response
            if (ContentEncoding != null)
                response.ContentEncoding = ContentEncoding;

            // verify this response has data
            if (Data == null)
                return;

            // write the response
            response.Write(JsonText);
        }

        // Object serialized to JSON using JSON.Net
        public string JsonText
        {
            get
            {
                try
                {
                    return JsonConvert.SerializeObject(Data, Formatting.Indented, JsonSerializerSettings);
                }
                catch (Exception ex)
                {
                    Debug.WriteLine(ex);
                    return string.Empty;
                }
            }
        }
    }
}
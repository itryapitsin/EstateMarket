﻿using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Core.Metadata.Edm;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Reflection;
using System.Reflection.Emit;

namespace Home.Web.Infrastructure
{
    /// <summary>
    /// Code First extensions.
    /// </summary>
    public static class DbContextExtensions
    {
        public static void Add<TEntity>(
            this DbContext context,
            TEntity entity,
            bool isApplyNow = true) where TEntity : class
        {
            AttachIfNotAttached(context, entity);
            context.Set(entity.GetType()).Add(entity);
            if (isApplyNow)
                context.SaveChanges();
        }

        public static void Update<TEntity>(
            this DbContext context,
            TEntity entity, 
            bool isApplyNow = true) where TEntity : class
        {
            AttachIfNotAttached(context, entity);
            context.Entry(entity).State = EntityState.Modified;
            if (isApplyNow)
                context.SaveChanges();
        }

        public static void Delete<TEntity>(
            this DbContext context, 
            TEntity entity,
            bool isApplyNow = true) where TEntity : class
        {
            AttachIfNotAttached(context, entity);
            context.Set(entity.GetType()).Remove(entity);
            context.Entry(entity).State = EntityState.Deleted;
            if (isApplyNow)
                context.SaveChanges();
        }

        public static void AttachIfNotAttached<TEntity>(
            this DbContext context,
            TEntity entity) where TEntity : class
        {
            if (context.Entry(entity).State != EntityState.Detached)
                return;
            context.Set(entity.GetType()).Attach(entity);
        }

        public static IQueryable<TEntity> RawSqlQuery<TEntity>(
            this DbContext context,
            string query,
            params object[] parameters) where TEntity : class
        {
            var result = context.Set<TEntity>().SqlQuery(query, parameters).AsQueryable();

            return result;
        }

        public static int RawSqlCommand(
            this DbContext context,
            string command,
            params object[] parameters)
        {
            return context.Database.ExecuteSqlCommand(command, parameters);
        }

        public static IQueryable<dynamic> RawSqlQuery(
            this DbContext context,
            List<Type> types,
            List<string> names,
            string query,
            params object[] parameters)
        {
            var builder = CreateTypeBuilder("MyDynamicAssembly", "MyModule", "MyType");

            var typesAndNames = types.Zip(names, (t, n) => new { Type = t, Name = n });
            foreach (var tn in typesAndNames)
            {
                CreateAutoImplementedProperty(builder, tn.Name, tn.Type);
            }

            var resultType = builder.CreateType();

            return context.Database.SqlQuery(resultType, query, parameters).Cast<dynamic>().AsQueryable();
        }


        private static TypeBuilder CreateTypeBuilder(
           string assemblyName,
            string moduleName,
            string typeName)
        {
            var typeBuilder = AppDomain
                .CurrentDomain
                .DefineDynamicAssembly(
                    new AssemblyName(assemblyName),
                    AssemblyBuilderAccess.Run)
                .DefineDynamicModule(moduleName)
                .DefineType(typeName, TypeAttributes.Public);

            typeBuilder.DefineDefaultConstructor(MethodAttributes.Public);
            return typeBuilder;
        }

        private static void CreateAutoImplementedProperty(
            TypeBuilder builder,
            string propertyName,
            Type propertyType)
        {
            const string privateFieldPrefix = "m_";
            const string getterPrefix = "get_";
            const string setterPrefix = "set_";

            // Generate the field.
            var fieldBuilder = builder.DefineField(
                string.Concat(privateFieldPrefix, propertyName),
                              propertyType, FieldAttributes.Private);

            // Generate the property
            var propertyBuilder = builder.DefineProperty(
                propertyName, System.Reflection.PropertyAttributes.HasDefault, propertyType, null);

            // Property getter and setter attributes.
            const MethodAttributes propertyMethodAttributes = MethodAttributes.Public
                                                              | MethodAttributes.SpecialName
                                                              | MethodAttributes.HideBySig;

            // Define the getter method.
            var getterMethod = builder.DefineMethod(
                string.Concat(getterPrefix, propertyName),
                propertyMethodAttributes, propertyType, Type.EmptyTypes);

            // Emit the IL code.
            // ldarg.0
            // ldfld,_field
            // ret
            var getterILCode = getterMethod.GetILGenerator();
            getterILCode.Emit(OpCodes.Ldarg_0);
            getterILCode.Emit(OpCodes.Ldfld, fieldBuilder);
            getterILCode.Emit(OpCodes.Ret);

            // Define the setter method.
            var setterMethod = builder.DefineMethod(
                string.Concat(setterPrefix, propertyName),
                propertyMethodAttributes, null, new[] { propertyType });

            // Emit the IL code.
            // ldarg.0
            // ldarg.1
            // stfld,_field
            // ret
            var setterILCode = setterMethod.GetILGenerator();
            setterILCode.Emit(OpCodes.Ldarg_0);
            setterILCode.Emit(OpCodes.Ldarg_1);
            setterILCode.Emit(OpCodes.Stfld, fieldBuilder);
            setterILCode.Emit(OpCodes.Ret);

            propertyBuilder.SetGetMethod(getterMethod);
            propertyBuilder.SetSetMethod(setterMethod);
        }

        /// <summary>
        /// Adds an entity (if newly created) or update (if has non-default Id).
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="context">The db context.</param>
        /// <param name="entity">The entity.</param>
        /// <returns></returns>
        /// <remarks>
        /// Will not work for HasDatabaseGeneratedOption(DatabaseGeneratedOption.None).
        /// Will not work for composite keys.
        /// </remarks>
        public static T AddOrUpdate<T>(this DbContext context, T entity)
            where T : class
        {
            if (context == null) throw new ArgumentNullException("context");
            if (entity == null) throw new ArgumentNullException("entity");

            if (IsTransient(context, entity))
            {
                context.Set<T>().Add(entity);
            }
            else
            {
                context.Set<T>().Attach(entity);
                context.Entry(entity).State = EntityState.Modified;
            }
            return entity;
        }

        /// <summary>
        /// Determines whether the specified entity is newly created (Id not specified).
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="context">The context.</param>
        /// <param name="entity">The entity.</param>
        /// <returns>
        ///   <c>true</c> if the specified entity is transient; otherwise, <c>false</c>.
        /// </returns>
        /// <remarks>
        /// Will not work for HasDatabaseGeneratedOption(DatabaseGeneratedOption.None).
        /// Will not work for composite keys.
        /// </remarks>
        public static bool IsTransient<T>(this DbContext context, T entity)
            where T : class
        {
            if (context == null) throw new ArgumentNullException("context");
            if (entity == null) throw new ArgumentNullException("entity");

            var propertyInfo = FindPrimaryKeyProperty<T>(context);
            var propertyType = propertyInfo.PropertyType;
            //what's the default value for the type?
            var transientValue = propertyType.IsValueType ?
                Activator.CreateInstance(propertyType) : null;
            //is the pk the same as the default value (int == 0, string == null ...)
            return Equals(propertyInfo.GetValue(entity, null), transientValue);
        }

        /// <summary>
        /// Loads a stub entity (or actual entity if already loaded).
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="context">The context.</param>
        /// <param name="id">The id.</param>
        /// <returns></returns>
        /// <remarks>
        /// Will not work for composite keys.
        /// </remarks>
        public static T Load<T>(this DbContext context, object id)
             where T : class
        {
            if (context == null)
                throw new ArgumentNullException("context");

            if (id == null)
                throw new ArgumentNullException("id");

            var property = FindPrimaryKeyProperty<T>(context);
            //check to see if it's already loaded (slow if large numbers loaded)
            var entity = context.Set<T>().Local
                .FirstOrDefault(x => id.Equals(property.GetValue(x, null)));
            if (entity == null)
            {
                //it's not loaded, just create a stub with only primary key set
                entity = CreateEntity<T>(id, property);

                context.Set<T>().Attach(entity);
            }
            return entity;
        }

        /// <summary>
        /// Determines whether the specified entity is loaded from the database.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="context">The context.</param>
        /// <param name="id">The id.</param>
        /// <returns>
        ///   <c>true</c> if the specified entity is loaded; otherwise, <c>false</c>.
        /// </returns>
        /// <remarks>
        /// Will not work for composite keys.
        /// </remarks>
        public static bool IsLoaded<T>(this DbContext context, object id)
            where T : class
        {
            if (context == null) throw new ArgumentNullException("context");
            if (id == null) throw new ArgumentNullException("id");

            var property = FindPrimaryKeyProperty<T>(context);
            //check to see if it's already loaded (slow if large numbers loaded)
            var entity = context.Set<T>().Local
                .FirstOrDefault(x => id.Equals(property.GetValue(x, null)));
            return entity != null;
        }

        /// <summary>
        /// Marks the reference navigation properties unchanged. 
        /// Use when adding a new entity whose references are known to be unchanged.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="context">The context.</param>
        /// <param name="entity">The entity.</param>
        public static void MarkReferencesUnchanged<T>(this DbContext context, T entity)
            where T : class
        {
            var objectContext = ((IObjectContextAdapter)context).ObjectContext;
            var objectSet = objectContext.CreateObjectSet<T>();
            var elementType = objectSet.EntitySet.ElementType;
            var navigationProperties = elementType.NavigationProperties;
            //the references
            var references = from navigationProperty in navigationProperties
                             let end = navigationProperty.ToEndMember
                             where end.RelationshipMultiplicity == RelationshipMultiplicity.ZeroOrOne ||
                             end.RelationshipMultiplicity == RelationshipMultiplicity.One
                             select navigationProperty.Name;
            //NB: We don't check Collections. EF wants to handle the object graph.

            var parentEntityState = context.Entry(entity).State;
            foreach (var navigationProperty in references)
            {
                //if it's modified but not loaded, don't need to touch it
                if (parentEntityState == EntityState.Modified &&
                    !context.Entry(entity).Reference(navigationProperty).IsLoaded)
                    continue;
                var propertyInfo = typeof(T).GetProperty(navigationProperty);
                var value = propertyInfo.GetValue(entity, null);
                context.Entry(value).State = EntityState.Unchanged;
            }
        }

        /// <summary>
        /// Merges a DTO into a new or existing entity attached/added to context
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="context">The context.</param>
        /// <param name="dataTransferObject">The data transfer object. It must have a primary key property of the same name and type as the actual entity.</param>
        /// <returns></returns>
        /// <remarks>
        /// Will not work for composite keys.
        /// </remarks>
        public static T Merge<T>(this DbContext context, T dataTransferObject)
             where T : class
        {
            if (context == null) throw new ArgumentNullException("context");
            if (dataTransferObject == null) throw new ArgumentNullException("dataTransferObject");

            var property = FindPrimaryKeyProperty<T>(context);
            //find the id property of the dto
            var idProperty = dataTransferObject.GetType().GetProperty(property.Name);
            if (idProperty == null)
                throw new InvalidOperationException("Cannot find an id on the dataTransferObject");
            var id = idProperty.GetValue(dataTransferObject, null);
            //has the id been set (existing item) or not (transient)?
            var propertyType = property.PropertyType;
            var transientValue = propertyType.IsValueType ?
                Activator.CreateInstance(propertyType) : null;
            var isTransient = Equals(id, transientValue);
            T entity;
            if (isTransient)
            {
                //it's transient, just create a dummy
                entity = CreateEntity<T>(id, property);
                //if DatabaseGeneratedOption(DatabaseGeneratedOption.None) and no id, this errors
                context.Set<T>().Attach(entity);
            }
            else
            {
                //try to load from identity map or database
                entity = context.Set<T>().Find(id);
                if (entity == null)
                {
                    //could not find entity, assume assigned primary key
                    entity = CreateEntity<T>(id, property);
                    context.Set<T>().Add(entity);
                }
            }
            //copy the values from DTO onto the entry
            context.Entry(entity).CurrentValues.SetValues(dataTransferObject);

            foreach (var _property in entity.GetType().GetProperties().Where(x => !x.PropertyType.IsValueType && !x.PropertyType.IsArray))
            {
                if (_property.PropertyType.IsGenericType && _property.PropertyType.GetGenericTypeDefinition() == typeof(ICollection<>))
                    context.Entry(entity).Collection(_property.Name).CurrentValue = dataTransferObject.GetType().GetProperty(_property.Name).GetValue(dataTransferObject, null);
                else
                    context.Entry(entity).Reference(_property.Name).CurrentValue = dataTransferObject.GetType().GetProperty(_property.Name).GetValue(dataTransferObject, null);
            }

            return entity;
        }


        private static PropertyInfo FindPrimaryKeyProperty<T>(IObjectContextAdapter context)
            where T : class
        {
            //find the primary key
            var objectContext = context.ObjectContext;
            //this will error if it's not a mapped entity
            var objectSet = objectContext.CreateObjectSet<T>();
            var elementType = objectSet.EntitySet.ElementType;
            var pk = elementType.KeyMembers.First();
            //look it up on the entity
            var propertyInfo = typeof(T).GetProperty(pk.Name);
            return propertyInfo;
        }

        private static T CreateEntity<T>(object id, PropertyInfo property)
            where T : class
        {
            // consider IoC here
            var entity = (T)Activator.CreateInstance(typeof(T));
            //set the value of the primary key (may error if wrong type)
            property.SetValue(entity, id, null);
            return entity;
        }
    }
    /// <summary>
    /// Metadata about a DbContext
    /// </summary>
    public static class DbContextMetadata
    {
        private static MetadataWorkspace FindMetadataWorkspace(IObjectContextAdapter context)
        {
            var objectContext = context.ObjectContext;
            return objectContext.MetadataWorkspace;
        }

        private static ObjectSet<T> FindObjectSet<T>(IObjectContextAdapter context)
            where T : class
        {
            var objectContext = context.ObjectContext;
            //this can throw an InvalidOperationException if it's not mapped
            var objectSet = objectContext.CreateObjectSet<T>();
            return objectSet;
        }

        private static IEnumerable<NavigationProperty> FindNavigationPropertyCollection<T>(
            IObjectContextAdapter context)
            where T : class
        {
            var objectSet = FindObjectSet<T>(context);
            var elementType = objectSet.EntitySet.ElementType;
            var navigationProperties = elementType.NavigationProperties;
            return navigationProperties;
        }

        /// <summary>
        /// Finds the names of the entities in a DbContext.
        /// </summary>
        public static IEnumerable<string> FindEntities(DbContext context)
        {
            var metadataWorkspace = FindMetadataWorkspace(context);
            var items = metadataWorkspace.GetItems<EntityType>(DataSpace.CSpace);
            return items.Select(t => t.FullName);
        }

        /// <summary>
        /// Finds the underlying table names.
        /// </summary>
        public static IEnumerable<string> FindTableNames(DbContext context)
        {
            var metadataWorkspace = FindMetadataWorkspace(context);
            //we don't have to force a metadata load in Code First, apparently
            var items = metadataWorkspace.GetItems<EntityType>(DataSpace.SSpace);
            //namespace name is not significant (it's not schema name)
            return items.Select(t => t.Name);
        }

        /// <summary>
        /// Finds the primary key property names for an entity of specified type.
        /// </summary>
        public static IEnumerable<string> FindPrimaryKey<T>(DbContext context)
            where T : class
        {
            var objectSet = FindObjectSet<T>(context);
            var elementType = objectSet.EntitySet.ElementType;
            return elementType.KeyMembers.Select(p => p.Name);
        }

        /// <summary>
        /// Determines whether the specified entity is transient.
        /// </summary>
        public static bool IsTransient<T>(DbContext context, T entity)
            where T : class
        {
            var pk = FindPrimaryKey<T>(context).First();
            //look it up on the entity
            var propertyInfo = typeof(T).GetProperty(pk);
            var propertyType = propertyInfo.PropertyType;
            //what's the default value for the type?
            var transientValue = propertyType.IsValueType ? Activator.CreateInstance(propertyType) : null;
            //is the pk the same as the default value (int == 0, string == null ...)
            return propertyInfo.GetValue(entity, null) == transientValue;
        }

        /// <summary>
        /// Finds the navigation properties (References and Collections)
        /// </summary>
        public static IEnumerable<string> FindNavigationProperties<T>(DbContext context)
            where T : class
        {
            var navigationProperties = FindNavigationPropertyCollection<T>(context);
            return navigationProperties.Select(p => p.Name);
        }

        /// <summary>
        /// Finds the navigation collection properties.
        /// </summary>
        public static IEnumerable<string> FindNavigationCollectionProperties<T>(DbContext context)
            where T : class
        {
            var navigationProperties = FindNavigationPropertyCollection<T>(context);

            return from navigationProperty in navigationProperties
                   where navigationProperty.ToEndMember.RelationshipMultiplicity ==
                        RelationshipMultiplicity.Many
                   select navigationProperty.Name;
        }

        /// <summary>
        /// Finds the navigation reference properties
        /// </summary>
        public static IEnumerable<string> FindNavigationReferenceProperties<T>(DbContext context)
            where T : class
        {
            var navigationProperties = FindNavigationPropertyCollection<T>(context);

            return from navigationProperty in navigationProperties
                   let end = navigationProperty.ToEndMember
                   where end.RelationshipMultiplicity == RelationshipMultiplicity.ZeroOrOne ||
                    end.RelationshipMultiplicity == RelationshipMultiplicity.One
                   select navigationProperty.Name;
        }
    }
}

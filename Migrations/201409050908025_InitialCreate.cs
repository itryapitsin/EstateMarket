namespace RealtyStore.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class InitialCreate : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.FileMetaDatas",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Filename = c.String(),
                        AdvertId = c.Guid(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.AspNetRoles",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128),
                        Name = c.String(nullable: false, maxLength: 256),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => t.Name, unique: true, name: "RoleNameIndex");
            
            CreateTable(
                "dbo.AspNetUserRoles",
                c => new
                    {
                        UserId = c.String(nullable: false, maxLength: 128),
                        RoleId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => new { t.UserId, t.RoleId })
                .ForeignKey("dbo.AspNetRoles", t => t.RoleId, cascadeDelete: true)
                .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId)
                .Index(t => t.RoleId);
            
            CreateTable(
                "dbo.AspNetUsers",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128),
                        Firstname = c.String(),
                        Lastname = c.String(),
                        RegistrationDate = c.DateTime(nullable: false),
                        LastVisitDate = c.DateTime(nullable: false),
                        Email = c.String(maxLength: 256),
                        EmailConfirmed = c.Boolean(nullable: false),
                        PasswordHash = c.String(),
                        SecurityStamp = c.String(),
                        PhoneNumber = c.String(),
                        PhoneNumberConfirmed = c.Boolean(nullable: false),
                        TwoFactorEnabled = c.Boolean(nullable: false),
                        LockoutEndDateUtc = c.DateTime(),
                        LockoutEnabled = c.Boolean(nullable: false),
                        AccessFailedCount = c.Int(nullable: false),
                        UserName = c.String(nullable: false, maxLength: 256),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => t.UserName, unique: true, name: "UserNameIndex");
            
            CreateTable(
                "dbo.AspNetUserClaims",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.String(nullable: false, maxLength: 128),
                        ClaimType = c.String(),
                        ClaimValue = c.String(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.AspNetUserLogins",
                c => new
                    {
                        LoginProvider = c.String(nullable: false, maxLength: 128),
                        ProviderKey = c.String(nullable: false, maxLength: 128),
                        UserId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => new { t.LoginProvider, t.ProviderKey, t.UserId })
                .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.Apartments",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        RealtyType = c.Int(nullable: false),
                        AdvertType = c.Int(nullable: false),
                        CreatedTime = c.DateTime(nullable: false),
                        Cost = c.Single(nullable: false),
                        Square = c.Single(nullable: false),
                        Latitude = c.Double(nullable: false),
                        Longitude = c.Double(nullable: false),
                        IsActive = c.Boolean(nullable: false),
                        ContactPhone = c.String(),
                        Description = c.String(),
                        ObjectType = c.Int(),
                        Rooms = c.Int(),
                        Floor = c.Int(),
                        FloorCount = c.Int(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Commercials",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        RealtyType = c.Int(nullable: false),
                        AdvertType = c.Int(nullable: false),
                        CreatedTime = c.DateTime(nullable: false),
                        Cost = c.Single(nullable: false),
                        Square = c.Single(nullable: false),
                        Latitude = c.Double(nullable: false),
                        Longitude = c.Double(nullable: false),
                        IsActive = c.Boolean(nullable: false),
                        ContactPhone = c.String(),
                        Description = c.String(),
                        ObjectType = c.Int(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Garages",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        RealtyType = c.Int(nullable: false),
                        AdvertType = c.Int(nullable: false),
                        CreatedTime = c.DateTime(nullable: false),
                        Cost = c.Single(nullable: false),
                        Square = c.Single(nullable: false),
                        Latitude = c.Double(nullable: false),
                        Longitude = c.Double(nullable: false),
                        IsActive = c.Boolean(nullable: false),
                        ContactPhone = c.String(),
                        Description = c.String(),
                        ObjectType = c.Int(),
                        HasSecurity = c.Boolean(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Houses",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        RealtyType = c.Int(nullable: false),
                        AdvertType = c.Int(nullable: false),
                        CreatedTime = c.DateTime(nullable: false),
                        Cost = c.Single(nullable: false),
                        Square = c.Single(nullable: false),
                        Latitude = c.Double(nullable: false),
                        Longitude = c.Double(nullable: false),
                        IsActive = c.Boolean(nullable: false),
                        ContactPhone = c.String(),
                        Description = c.String(),
                        ObjectType = c.Int(),
                        HouseSquare = c.Single(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Lands",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        RealtyType = c.Int(nullable: false),
                        AdvertType = c.Int(nullable: false),
                        CreatedTime = c.DateTime(nullable: false),
                        Cost = c.Single(nullable: false),
                        Square = c.Single(nullable: false),
                        Latitude = c.Double(nullable: false),
                        Longitude = c.Double(nullable: false),
                        IsActive = c.Boolean(nullable: false),
                        ContactPhone = c.String(),
                        Description = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Rooms",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        RealtyType = c.Int(nullable: false),
                        AdvertType = c.Int(nullable: false),
                        CreatedTime = c.DateTime(nullable: false),
                        Cost = c.Single(nullable: false),
                        Square = c.Single(nullable: false),
                        Latitude = c.Double(nullable: false),
                        Longitude = c.Double(nullable: false),
                        IsActive = c.Boolean(nullable: false),
                        ContactPhone = c.String(),
                        Description = c.String(),
                        ObjectType = c.Int(),
                        Rooms = c.Int(),
                        Floor = c.Int(),
                        FloorCount = c.Int(),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.AspNetUserRoles", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.AspNetUserLogins", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.AspNetUserClaims", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.AspNetUserRoles", "RoleId", "dbo.AspNetRoles");
            DropIndex("dbo.AspNetUserLogins", new[] { "UserId" });
            DropIndex("dbo.AspNetUserClaims", new[] { "UserId" });
            DropIndex("dbo.AspNetUsers", "UserNameIndex");
            DropIndex("dbo.AspNetUserRoles", new[] { "RoleId" });
            DropIndex("dbo.AspNetUserRoles", new[] { "UserId" });
            DropIndex("dbo.AspNetRoles", "RoleNameIndex");
            DropTable("dbo.Rooms");
            DropTable("dbo.Lands");
            DropTable("dbo.Houses");
            DropTable("dbo.Garages");
            DropTable("dbo.Commercials");
            DropTable("dbo.Apartments");
            DropTable("dbo.AspNetUserLogins");
            DropTable("dbo.AspNetUserClaims");
            DropTable("dbo.AspNetUsers");
            DropTable("dbo.AspNetUserRoles");
            DropTable("dbo.AspNetRoles");
            DropTable("dbo.FileMetaDatas");
        }
    }
}

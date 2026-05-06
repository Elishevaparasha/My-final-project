using System.Data.Entity;
using Dal_layer.Models;

namespace Dal_layer
{
    public class AppDbContext : DbContext
    {
        public AppDbContext() : base("name=DefaultConnection") { }

        public DbSet<User> Users { get; set; }
        public DbSet<Video> Videos { get; set; }
        public DbSet<Article> Articles { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Video>().ToTable("Videos");
            modelBuilder.Entity<Article>().ToTable("Articles");
        }
    }
}

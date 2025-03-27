using AnimationProject.Generic;
using AnimationProject.Helpers;
using AnimationProject.Services;
using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using System.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddScoped<IServiceAPI, ServiceAPI>();
builder.Services.AddScoped<ICheckSession, CheckSession>();
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));
var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Canvas}/{action=Index}/{id?}");

app.Run();

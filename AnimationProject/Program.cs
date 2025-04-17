using AnimationProject.Generic;
using AnimationProject.Helpers;
using AnimationProject.Services;
using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using System.Configuration;
using System.Threading.Channels;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Json;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddScoped<IServiceAPI, ServiceAPI>();
builder.Services.AddScoped<ICheckSession, CheckSession>();
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));

// Create an unbounded channel for refresh events.
var refreshChannel = Channel.CreateUnbounded<string>();

// Register the channel writer with the RefreshNotifier.
builder.Services.AddSingleton<IRefreshNotifier>(new RefreshNotifier(refreshChannel.Writer));


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
    pattern: "{controller=Canvas}/{action=Login}/{id?}");

// SSE endpoint: Clients connect here to listen for refresh events.
app.MapGet("/sse", async (HttpContext context) =>
{
    context.Response.Headers.Add("Content-Type", "text/event-stream");

    while (!context.RequestAborted.IsCancellationRequested)
    {
        // Wait for a message in the channel.
        var message = await refreshChannel.Reader.ReadAsync(context.RequestAborted);
        await context.Response.WriteAsync($"data: {message}\n\n");
        await context.Response.Body.FlushAsync();
    }
});

app.Run();

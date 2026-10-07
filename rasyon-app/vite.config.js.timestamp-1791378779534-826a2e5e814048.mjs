// vite.config.js
import { defineConfig } from "file:///C:/Users/acer/OneDrive/Belgeler/GitHub/Rasyon-Program/rasyon-app/node_modules/vite/dist/node/index.js";
import { VitePWA } from "file:///C:/Users/acer/OneDrive/Belgeler/GitHub/Rasyon-Program/rasyon-app/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  root: ".",
  publicDir: "public",
  plugins: [
    // FAZ 15.3 — PWA: çevrimdışı çalışma + mobil install
    VitePWA({
      registerType: "prompt",
      // Yeni sürüm inince kullanıcıya bildirimi tetikler
      injectRegister: "auto",
      // register script index.html'e otomatik enjekte
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      manifest: {
        name: "RasyoMetri",
        short_name: "RasyoMetri",
        description: "NRC 2001 / NASEM 2021 / CNCPS v6.5 tabanl\u0131 s\xFCt s\u0131\u011F\u0131r\u0131 rasyon optimizasyonu",
        lang: "tr",
        dir: "ltr",
        theme_color: "#2d7d46",
        background_color: "#f5f7f5",
        display: "standalone",
        start_url: "/",
        scope: "/",
        categories: ["agriculture", "productivity", "business"],
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        // Tüm uygulama varlıkları precache (çevrimdışı çalışma için WASM + font dahil)
        globPatterns: ["**/*.{js,css,html,svg,wasm,woff,woff2}"],
        // PDF/Excel dinamik chunk'ları büyük → precache limitini yükselt
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // PDF Türkçe fontu (DejaVu, jsDelivr CDN) — ilk çevrimiçi kullanımdan sonra cache
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "jsdelivr-cdn",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: {
        // SW yalnızca production build'de aktif. Dev'de kapalı: HMR ile SW cache
        // çakışmasını (stale asset sürprizi) önler. PWA bir production özelliğidir;
        // doğrulama `npm run build` + `npm run preview` ile yapılır.
        enabled: false,
        type: "module"
      }
    })
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "index.html"
    }
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.js"],
    setupFiles: ["tests/setup/indexeddb.js"],
    coverage: {
      reporter: ["text", "html"],
      include: ["src/core/**", "src/solver/**", "src/data/**"]
    }
  },
  worker: {
    format: "es"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhY2VyXFxcXE9uZURyaXZlXFxcXEJlbGdlbGVyXFxcXEdpdEh1YlxcXFxSYXN5b24tUHJvZ3JhbVxcXFxyYXN5b24tYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhY2VyXFxcXE9uZURyaXZlXFxcXEJlbGdlbGVyXFxcXEdpdEh1YlxcXFxSYXN5b24tUHJvZ3JhbVxcXFxyYXN5b24tYXBwXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9hY2VyL09uZURyaXZlL0JlbGdlbGVyL0dpdEh1Yi9SYXN5b24tUHJvZ3JhbS9yYXN5b24tYXBwL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICByb290OiAnLicsXHJcbiAgcHVibGljRGlyOiAncHVibGljJyxcclxuICBwbHVnaW5zOiBbXHJcbiAgICAvLyBGQVogMTUuMyBcdTIwMTQgUFdBOiBcdTAwRTdldnJpbWRcdTAxMzFcdTAxNUZcdTAxMzEgXHUwMEU3YWxcdTAxMzFcdTAxNUZtYSArIG1vYmlsIGluc3RhbGxcclxuICAgIFZpdGVQV0Eoe1xyXG4gICAgICByZWdpc3RlclR5cGU6ICdwcm9tcHQnLCAgICAgICAgICAvLyBZZW5pIHNcdTAwRkNyXHUwMEZDbSBpbmluY2Uga3VsbGFuXHUwMTMxY1x1MDEzMXlhIGJpbGRpcmltaSB0ZXRpa2xlclxyXG4gICAgICBpbmplY3RSZWdpc3RlcjogJ2F1dG8nLCAgICAgICAgICAvLyByZWdpc3RlciBzY3JpcHQgaW5kZXguaHRtbCdlIG90b21hdGlrIGVuamVrdGVcclxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLnBuZycsICdhcHBsZS10b3VjaC1pY29uLnBuZyddLFxyXG4gICAgICBtYW5pZmVzdDoge1xyXG4gICAgICAgIG5hbWU6ICdSYXN5b01ldHJpJyxcclxuICAgICAgICBzaG9ydF9uYW1lOiAnUmFzeW9NZXRyaScsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdOUkMgMjAwMSAvIE5BU0VNIDIwMjEgLyBDTkNQUyB2Ni41IHRhYmFubFx1MDEzMSBzXHUwMEZDdCBzXHUwMTMxXHUwMTFGXHUwMTMxclx1MDEzMSByYXN5b24gb3B0aW1pemFzeW9udScsXHJcbiAgICAgICAgbGFuZzogJ3RyJyxcclxuICAgICAgICBkaXI6ICdsdHInLFxyXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnIzJkN2Q0NicsXHJcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNmNWY3ZjUnLFxyXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcclxuICAgICAgICBzdGFydF91cmw6ICcvJyxcclxuICAgICAgICBzY29wZTogJy8nLFxyXG4gICAgICAgIGNhdGVnb3JpZXM6IFsnYWdyaWN1bHR1cmUnLCAncHJvZHVjdGl2aXR5JywgJ2J1c2luZXNzJ10sXHJcbiAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgIHsgc3JjOiAnaWNvbi0xOTIucG5nJywgc2l6ZXM6ICcxOTJ4MTkyJywgdHlwZTogJ2ltYWdlL3BuZycsIHB1cnBvc2U6ICdhbnknIH0sXHJcbiAgICAgICAgICB7IHNyYzogJ2ljb24tNTEyLnBuZycsIHNpemVzOiAnNTEyeDUxMicsIHR5cGU6ICdpbWFnZS9wbmcnLCBwdXJwb3NlOiAnYW55JyB9LFxyXG4gICAgICAgICAgeyBzcmM6ICdpY29uLW1hc2thYmxlLnBuZycsIHNpemVzOiAnNTEyeDUxMicsIHR5cGU6ICdpbWFnZS9wbmcnLCBwdXJwb3NlOiAnbWFza2FibGUnIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgICAgd29ya2JveDoge1xyXG4gICAgICAgIC8vIFRcdTAwRkNtIHV5Z3VsYW1hIHZhcmxcdTAxMzFrbGFyXHUwMTMxIHByZWNhY2hlIChcdTAwRTdldnJpbWRcdTAxMzFcdTAxNUZcdTAxMzEgXHUwMEU3YWxcdTAxMzFcdTAxNUZtYSBpXHUwMEU3aW4gV0FTTSArIGZvbnQgZGFoaWwpXHJcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLHN2Zyx3YXNtLHdvZmYsd29mZjJ9J10sXHJcbiAgICAgICAgLy8gUERGL0V4Y2VsIGRpbmFtaWsgY2h1bmsnbGFyXHUwMTMxIGJcdTAwRkN5XHUwMEZDayBcdTIxOTIgcHJlY2FjaGUgbGltaXRpbmkgeVx1MDBGQ2tzZWx0XHJcbiAgICAgICAgbWF4aW11bUZpbGVTaXplVG9DYWNoZUluQnl0ZXM6IDYgKiAxMDI0ICogMTAyNCxcclxuICAgICAgICBjbGVhbnVwT3V0ZGF0ZWRDYWNoZXM6IHRydWUsXHJcbiAgICAgICAgY2xpZW50c0NsYWltOiB0cnVlLFxyXG4gICAgICAgIHJ1bnRpbWVDYWNoaW5nOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIFBERiBUXHUwMEZDcmtcdTAwRTdlIGZvbnR1IChEZWphVnUsIGpzRGVsaXZyIENETikgXHUyMDE0IGlsayBcdTAwRTdldnJpbWlcdTAwRTdpIGt1bGxhblx1MDEzMW1kYW4gc29ucmEgY2FjaGVcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9jZG5cXC5qc2RlbGl2clxcLm5ldFxcLy4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcclxuICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2pzZGVsaXZyLWNkbicsXHJcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjogeyBtYXhFbnRyaWVzOiAzMCwgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzY1IH0sXHJcbiAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHsgc3RhdHVzZXM6IFswLCAyMDBdIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICAgIGRldk9wdGlvbnM6IHtcclxuICAgICAgICAvLyBTVyB5YWxuXHUwMTMxemNhIHByb2R1Y3Rpb24gYnVpbGQnZGUgYWt0aWYuIERldidkZSBrYXBhbFx1MDEzMTogSE1SIGlsZSBTVyBjYWNoZVxyXG4gICAgICAgIC8vIFx1MDBFN2FrXHUwMTMxXHUwMTVGbWFzXHUwMTMxblx1MDEzMSAoc3RhbGUgYXNzZXQgc1x1MDBGQ3Jwcml6aSkgXHUwMEY2bmxlci4gUFdBIGJpciBwcm9kdWN0aW9uIFx1MDBGNnplbGxpXHUwMTFGaWRpcjtcclxuICAgICAgICAvLyBkb1x1MDExRnJ1bGFtYSBgbnBtIHJ1biBidWlsZGAgKyBgbnBtIHJ1biBwcmV2aWV3YCBpbGUgeWFwXHUwMTMxbFx1MDEzMXIuXHJcbiAgICAgICAgZW5hYmxlZDogZmFsc2UsXHJcbiAgICAgICAgdHlwZTogJ21vZHVsZScsXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICBdLFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBvdXREaXI6ICdkaXN0JyxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgaW5wdXQ6ICdpbmRleC5odG1sJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICB0ZXN0OiB7XHJcbiAgICBnbG9iYWxzOiB0cnVlLFxyXG4gICAgZW52aXJvbm1lbnQ6ICdub2RlJyxcclxuICAgIGluY2x1ZGU6IFsndGVzdHMvKiovKi50ZXN0LmpzJ10sXHJcbiAgICBzZXR1cEZpbGVzOiBbJ3Rlc3RzL3NldHVwL2luZGV4ZWRkYi5qcyddLFxyXG4gICAgY292ZXJhZ2U6IHtcclxuICAgICAgcmVwb3J0ZXI6IFsndGV4dCcsICdodG1sJ10sXHJcbiAgICAgIGluY2x1ZGU6IFsnc3JjL2NvcmUvKionLCAnc3JjL3NvbHZlci8qKicsICdzcmMvZGF0YS8qKiddLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHdvcmtlcjoge1xyXG4gICAgZm9ybWF0OiAnZXMnLFxyXG4gIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtZLFNBQVMsb0JBQW9CO0FBQy9aLFNBQVMsZUFBZTtBQUV4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixXQUFXO0FBQUEsRUFDWCxTQUFTO0FBQUE7QUFBQSxJQUVQLFFBQVE7QUFBQSxNQUNOLGNBQWM7QUFBQTtBQUFBLE1BQ2QsZ0JBQWdCO0FBQUE7QUFBQSxNQUNoQixlQUFlLENBQUMsZUFBZSxzQkFBc0I7QUFBQSxNQUNyRCxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixNQUFNO0FBQUEsUUFDTixLQUFLO0FBQUEsUUFDTCxhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxXQUFXO0FBQUEsUUFDWCxPQUFPO0FBQUEsUUFDUCxZQUFZLENBQUMsZUFBZSxnQkFBZ0IsVUFBVTtBQUFBLFFBQ3RELE9BQU87QUFBQSxVQUNMLEVBQUUsS0FBSyxnQkFBZ0IsT0FBTyxXQUFXLE1BQU0sYUFBYSxTQUFTLE1BQU07QUFBQSxVQUMzRSxFQUFFLEtBQUssZ0JBQWdCLE9BQU8sV0FBVyxNQUFNLGFBQWEsU0FBUyxNQUFNO0FBQUEsVUFDM0UsRUFBRSxLQUFLLHFCQUFxQixPQUFPLFdBQVcsTUFBTSxhQUFhLFNBQVMsV0FBVztBQUFBLFFBQ3ZGO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUztBQUFBO0FBQUEsUUFFUCxjQUFjLENBQUMsd0NBQXdDO0FBQUE7QUFBQSxRQUV2RCwrQkFBK0IsSUFBSSxPQUFPO0FBQUEsUUFDMUMsdUJBQXVCO0FBQUEsUUFDdkIsY0FBYztBQUFBLFFBQ2QsZ0JBQWdCO0FBQUEsVUFDZDtBQUFBO0FBQUEsWUFFRSxZQUFZO0FBQUEsWUFDWixTQUFTO0FBQUEsWUFDVCxTQUFTO0FBQUEsY0FDUCxXQUFXO0FBQUEsY0FDWCxZQUFZLEVBQUUsWUFBWSxJQUFJLGVBQWUsS0FBSyxLQUFLLEtBQUssSUFBSTtBQUFBLGNBQ2hFLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxHQUFHLEdBQUcsRUFBRTtBQUFBLFlBQzFDO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxZQUFZO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFJVixTQUFTO0FBQUEsUUFDVCxNQUFNO0FBQUEsTUFDUjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxNQUNiLE9BQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0osU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsU0FBUyxDQUFDLG9CQUFvQjtBQUFBLElBQzlCLFlBQVksQ0FBQywwQkFBMEI7QUFBQSxJQUN2QyxVQUFVO0FBQUEsTUFDUixVQUFVLENBQUMsUUFBUSxNQUFNO0FBQUEsTUFDekIsU0FBUyxDQUFDLGVBQWUsaUJBQWlCLGFBQWE7QUFBQSxJQUN6RDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLFFBQVE7QUFBQSxFQUNWO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K

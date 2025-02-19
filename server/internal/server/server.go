package server

import (
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/PGo-Projects/output"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/gorilla/csrf"
	"github.com/lpar/gzipped"
	"github.com/pchan37/team-cia/server/internal/config"
	"github.com/pchan37/team-cia/server/internal/security"
	"github.com/pchan37/team-cia/server/internal/views"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

func isValidStaticAssetPath(path string) bool {
	webAssetsDirectory := viper.GetString(config.WebAssetsPathKey)
	resourcePath := filepath.Join(webAssetsDirectory, path)
	stat, err := os.Stat(resourcePath)
	if err == nil {
		return !stat.IsDir()
	}
	return !os.IsNotExist(err)
}
func serveStaticOrIndex(w http.ResponseWriter, r *http.Request) {
	potentialStaticAssetPath := strings.TrimLeft(r.URL.Path, "/")
	if r.URL.Path == "/" || !isValidStaticAssetPath(potentialStaticAssetPath) {
		r.URL.Path = "/index.html"
		w.Header().Set("X-CSRF-TOKEN", csrf.Token(r))
	}
	webAssetsDirectory := http.Dir(viper.GetString(config.WebAssetsPathKey))
	gzipped.FileServer(webAssetsDirectory).ServeHTTP(w, r)
}

func MustRun(cmd *cobra.Command, arg []string) {
	mux := chi.NewRouter()
	mux.Use(middleware.Logger)

	security.MustSetup(mux)
	views.RegisterEndPoints(mux)
	mux.MethodFunc(http.MethodGet, "/*", serveStaticOrIndex)

	if config.DevRun {
		output.Println("Attempting to run on localhost:8080...", output.BLUE)
		log.Fatal(http.ListenAndServe(":8080", mux))
	} else {
		SOCK := viper.GetString(config.SockName)
		os.Remove(SOCK)
		unixListener, err := net.Listen("unix", SOCK)
		if err != nil {
			output.Errorln(err)
		}
		os.Chmod(SOCK, 0666)
		defer unixListener.Close()

		output.Println("Attempting to run on unix socket...", output.BLUE)
		log.Fatal(http.Serve(unixListener, mux))
	}
}

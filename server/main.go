package main

import (
	"github.com/PGo-Projects/output"
	"github.com/pchan37/team-cia/server/internal/config"
	"github.com/pchan37/team-cia/server/internal/server"
	"github.com/spf13/cobra"
)

var (
	ServerCmd = &cobra.Command{
		Use: "server",
		Run: server.MustRun,
	}
)

func init() {
	ServerCmd.PersistentFlags().BoolVar(&config.DevRun, "dev", false,
		"Run the server on a dev machine")
	cobra.OnInitialize(config.MustInit)
}

func main() {
	if err := ServerCmd.Execute(); err != nil {
		output.ErrorAndPanic(err)
	}
}

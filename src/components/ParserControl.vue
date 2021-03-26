<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-card>
          <v-row>
            <v-col class="px-10 d-flex align-center justify-center">
              <v-spacer />
              <v-btn>Start</v-btn>
              <v-spacer />
              <v-btn>Stop</v-btn>
              <v-spacer />
            </v-col>
          </v-row>
          <v-row>
            <v-col align="left" class="px-10">
              <v-list dense>
                <v-subheader>
                  LOG
                  <v-spacer />
                  <v-btn :disabled="logs.length === 0" x-small icon @click="clearLogs()">
                    <v-icon v-if="!logs.length">mdi-delete-outline</v-icon>
                    <v-icon color="red lighten-3" v-else>mdi-delete-forever</v-icon>
                  </v-btn>
                </v-subheader>
                <v-list-item-group color="primary">
                  <v-list-item v-for="(log, i) in logs" :key="i">
                    <v-list-item-icon>
                      <v-icon v-text="icons[log.event].icon" :color="icons[log.event].color"></v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        <span class="timestamp mr-4">{{ log.time }}</span> {{ log.text }}
                      </v-list-item-title>
                      <!-- <v-list-item-subtitle ref="logs" v-text="checkOverflow(`log-${i}`)"> </v-list-item-subtitle> -->
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'ParserControl',

  data() {
    return {
      loading: false,
      icons: {
        ok: { icon: 'mdi-checkbox-marked-outline', color: 'green' },
        info: { icon: 'mdi-alert-circle-check-outline', color: 'info' },
        warn: { icon: 'mdi-alert-outline', color: 'orange' },
        error: { icon: 'mdi-alert-octagram-outline', color: 'red' }
      },
      logs: []
    };
  },

  created() {
    const thisclass = this;
    window.ipcRenderer.on('job', function(event, arg) {
      if (arg === 'started') thisclass.loading = true;
      if (arg === 'stopped') thisclass.loading = false;
    });
    window.ipcRenderer.on('log', function(event, arg) {
      thisclass.logs.unshift(arg);
      if (thisclass.logs.length > 30) thisclass.logs.length = 30;
    });
  },

  methods: {
    startMain: function() {
      window.ipcRenderer.send('job', 'init');
    },
    startCheck: function() {
      window.ipcRenderer.send('job', 'check');
    },
    checkOverflow: function(id) {
      console.log(id);
      console.log(this.$refs);
      console.log(this.$refs['logs']);
      const elem = document.getElementById(id);
      const elemWidth = elem.getBoundingClientRect().width;
      const parentWidth = elem.parentElement.getBoundingClientRect().width;

      return elemWidth > parentWidth;
    },
    clearLogs: function() {
      this.logs = [];
    }
  }
};
</script>

<style lang="sass">
.v-card
  background-color: rgba(255, 255, 255, 0.3) !important
  backdrop-filter: blur(10px)
  box-shadow: 0px 2px 10px 0px rgba(10, 75, 112, 0.2)
  max-width: 1000px
  min-width: 480px !important
  align-self: center
  width: 100%

.timestamp
 color: #bbb !important
</style>

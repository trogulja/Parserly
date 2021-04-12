<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-card>
          <v-row>
            <v-col class="px-10 d-flex align-center justify-center">
              <v-switch v-model="crontab" inset :label="`Crontab is ${loading ? '...' : crontab ? 'on' : 'off'}`" :disabled="loading" :loading="loading" @change="switchCrontab" />
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
        debug: { icon: 'mdi-checkbox-marked-outline', color: 'green' },
        progress: { icon: 'mdi-checkbox-marked-outline', color: 'primary' },
        info: { icon: 'mdi-alert-circle-check-outline', color: 'info' },
        warn: { icon: 'mdi-alert-outline', color: 'orange' },
        error: { icon: 'mdi-alert-octagram-outline', color: 'red' },
      },
      logs: [],
      crontab: false
    };
  },

  created() {
    const thisclass = this;
    window.ipcRenderer.on('job', function(event, arg) {
      if (arg === 'started' || arg === 'stopped') thisclass.loading = false;
      if (arg === 'started') thisclass.crontab = true;
      if (arg === 'stopped') thisclass.crontab = false;
    });
    window.ipcRenderer.on('log', function(event, arg) {
      thisclass.logs.unshift(arg);
      if (thisclass.logs.length > 30) thisclass.logs.length = 30;
    });
    setTimeout(() => {
      thisclass.loading = true;
      thisclass.crontab = true;
      window.ipcRenderer.send('job', 'start');
    }, 500);
  },

  methods: {
    start: function() {
      this.loading = true;
    },
    stop: function() {
      this.loading = false;
    },
    switchCrontab: function(state) {
      this.loading = true;
      if (state) window.ipcRenderer.send('job', 'start');
      else window.ipcRenderer.send('job', 'stop');
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

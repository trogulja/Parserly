<template>
  <v-app>
    <v-app-bar app color="grey lighten-2">
      <v-toolbar-title>
        <v-btn disabled icon>
          <v-img :src="require('./assets/parserly.svg')" contain aspect-ration="1" height="45" />
        </v-btn>
        {{ meta.name }} <v-chip v-if="meta.version" color="green" label small outlined>v{{ meta.version }}</v-chip>
      </v-toolbar-title>
      <v-spacer />
    </v-app-bar>
    <v-main>
      <ParserControl />
    </v-main>
  </v-app>
</template>

<script>
import ParserControl from './components/ParserControl';

export default {
  name: 'App',

  components: {
    ParserControl
  },

  data() {
    return {
      meta: {
        name: 'Parserly',
        version: false
      }
    };
  },

  created() {
    const thisclass = this;
    window.ipcRenderer.on('title', function(event, arg) {
      thisclass.meta.name = arg.name;
      thisclass.meta.version = arg.version;
    });
    window.ipcRenderer.on('job', function(event, arg) {
      if (arg === 'started') thisclass.loading = true;
      if (arg === 'stopped') thisclass.loading = false;
      if (typeof arg === 'number') thisclass.loadingValue = arg;
      if (arg === 100) thisclass.loading = false;
    });
  }
};
</script>

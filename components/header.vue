<template>
  <header>
    <nav>
      <div class="left">
        <a href="https://wonderwall.finance" target="_blank">
          <logo />
        </a>
      </div>
      <div class="right">
        <ul class="socials">
          <li>
            <a href="https://discord.gg/cryptoasisds" target="_blank">
              <discord />
            </a>
          </li>
          <li>
            <a href="https://twitter.com/CryptOasisDS" target="_blank">
              <twitter />
            </a>
          </li>
          <li>
            <a href="https://t.me/CryptOasisChat" target="_blank">
              <telegram />
            </a>
          </li>
          <li>
            <a href="https://bscscan.com/token/0xd9c99510a5e3145359d91fe9caf92dd5d68b603a" target="_blank">
              <bscscan />
            </a>
          </li>
        </ul>
        <button-component :loading="loading" type="danger" classes="btn--round" @click="!user.auth ? connectProvider() : changeProvider()">
          {{ !user.auth ? 'Connect wallet' : 'Change wallet' }}
        </button-component>
      </div>
    </nav>
  </header>
</template>

<script lang="ts" src="./src/header.ts">
</script>

<style scoped lang="stylus">
  @import 'assets/css/components/header.styl'
</style>

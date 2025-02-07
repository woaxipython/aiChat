<script lang="ts" setup>

defineProps({
  enterAction: {
    type: Object,
    required: true
  }
})
function addNewChat() {
}
</script>

<template>
  <div class="d-flex" style="height: 100%;">
    <!-- 左侧固定宽度为 4rem -->
    <div class="card flex-shrink-0 border-0" style="width: 4rem; height: 100%;">
      <div class="badge bg-white border-0">
        <div class="card-body p-0 scrollable flex-fill h-100">
          <div class="nav flex-column nav-pills">
            <button class="m-1 p-2 btn btn-outline-info border-0 active" v-tooltip="'聊天室'">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-hipchat m-0">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path
                    d="M17.802 17.292s.077 -.055 .2 -.149c1.843 -1.425 3 -3.49 3 -5.789c0 -4.286 -4.03 -7.764 -9 -7.764c-4.97 0 -9 3.478 -9 7.764c0 4.288 4.03 7.646 9 7.646c.424 0 1.12 -.028 2.088 -.084c1.262 .82 3.104 1.493 4.716 1.493c.499 0 .734 -.41 .414 -.828c-.486 -.596 -1.156 -1.551 -1.416 -2.29z" />
                  <path d="M7.5 13.5c2.5 2.5 6.5 2.5 9 0" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- 右侧占据剩余空间 -->
    <div class="card flex-fill h-100">
      <div class="row g-0 flex-fill h-100">
        <div class="col-3 border-0 border-end">
          <div class="d-flex w-100 border-0 border-bottom  p-2 card-header d-none d-md-block" style="width: 3rem;">
            <div class="d-flex justify-content-between w-100">
              <button class="btn btn-outline-secondary border-0 py-2"  v-tooltip="'点击选择机器人'">
                <span>
                  <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="1"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-github-copilot m-0"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 18v-5.5c0 -.667 .167 -1.333 .5 -2" /><path d="M12 7.5c0 -1 -.01 -4.07 -4 -3.5c-3.5 .5 -4 2.5 -4 3.5c0 1.5 0 4 3 4c4 0 5 -2.5 5 -4z" /><path d="M4 12c-1.333 .667 -2 1.333 -2 2c0 1 0 3 1.5 4c3 2 6.5 3 8.5 3s5.499 -1 8.5 -3c1.5 -1 1.5 -3 1.5 -4c0 -.667 -.667 -1.333 -2 -2" /><path d="M20 18v-5.5c0 -.667 -.167 -1.333 -.5 -2" /><path d="M12 7.5l0 -.297l.01 -.269l.027 -.298l.013 -.105l.033 -.215c.014 -.073 .029 -.146 .046 -.22l.06 -.223c.336 -1.118 1.262 -2.237 3.808 -1.873c2.838 .405 3.703 1.797 3.93 2.842l.036 .204c0 .033 .01 .066 .013 .098l.016 .185l0 .171l0 .49l-.015 .394l-.02 .271c-.122 1.366 -.655 2.845 -2.962 2.845c-3.256 0 -4.524 -1.656 -4.883 -3.081l-.053 -.242a3.865 3.865 0 0 1 -.036 -.235l-.021 -.227a3.518 3.518 0 0 1 -.007 -.215z" /><path d="M10 15v2" /><path d="M14 15v2" /></svg>
                </span>
              </button>
              <button  class="btn btn-outline-warning border-0 py-2"  v-tooltip="'新增聊天'">
                <span>
                  <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="1"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-message-circle-plus m-0"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12.007 19.98a9.869 9.869 0 0 1 -4.307 -.98l-4.7 1l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c1.992 1.7 2.93 4.04 2.747 6.34" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>
                </span>
              </button>
            </div>

          </div>
          .
        </div>
      </div>

    </div>
  </div>



</template>

<!-- <template>
  <div class="hello">
    <button @click="sayHello" class="btn">不知道是啥</button>
    <h2>插件应用进入参数</h2>
    <pre>
        {{ JSON.stringify(enterAction, undefined, 2) }}
      </pre>
  </div>
</template> -->


<style>
.hello {
  padding: 10px 28px;
}
</style>
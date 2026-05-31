<template>
  <div>
    <div id="editor" style="text-align:left" />
    <MaterialList v-show="false" v-model="imgArr" :parent-dialog-visible="visable" style="width: 100px" type="image" :num="1" :width="90" :height="90" @selectMaterial="handleSelect" @cancel="handleCancel" />
  </div>
</template>

<script>
import WE from 'wangeditor'
import MaterialList from '../material'
export default {
  name: 'Editor',
  components: { MaterialList },
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      visable: false,
      editor: null,
      imgArr: []
    }
  },
  mounted() {
    var editor = new WE('#editor')
    this.editor = editor
    editor.customConfig.menus = [
      'head', // 标题
      'bold', // 粗体
      'fontSize', // 字号
      'fontName', // 字体
      'italic', // 斜体
      'underline', // 下划线
      'strikeThrough', // 删除线
      'foreColor', // 文字颜色
      'backColor', // 背景颜色
      'link', // 插入链接
      'list', // 列表
      'justify', // 对齐方式
      'image', // 插入图片
      'table', // 表格
      'code', // 插入代码
      'undo', // 撤销
      'redo' // 重复
    ]
    editor.customConfig.zIndex = 80
    editor.customConfig.onchange = (html) => {
      this.$emit('handleContentAndHtml', editor.txt.text(), html)
    }
    editor.create()
    editor.menus.menus.image.$elem.selector = '<div class="w-e-menu"><i class="el-icon-picture"></i></div>'

    editor.menus.menus.image.$elem[0].onclick = (e) => {
      this.visable = true
      this.imgArr = []
    }
    editor.txt.html(this.data && this.data.html ? this.data.html : '')
  },
  methods: {
    handleSelect(img) {
      this.visable = false
      this.editor.cmd.do('insertHTML', '<img src="' + img + '" style="max-width:100%;"/>')
    },
    handleCancel() {
      this.visable = false
    }
  }
}
</script>

<style scoped>
</style>

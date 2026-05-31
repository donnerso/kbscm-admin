<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.title" clearable placeholder="输入文章标题搜索" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="750px">
      <div :style="dialogStyle">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-row type="flex" :gutter="15">
            <el-col :span="24">
              <el-form-item label="标题" prop="title">
                <el-input v-model="form.title" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row type="flex" :gutter="15">
            <el-col :span="24">
              <el-form-item label="副标题">
                <el-input v-model="form.subtitle" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row type="flex" :gutter="15">
            <el-col :span="24">
              <el-form-item label="图片">
                <MaterialList v-model="imageArr" style="width: 400px" type="image" :num="1" :width="120" :height="120" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row type="flex" :gutter="15">
            <el-col :span="24">
              <el-form-item label="关键词" prop="tagRelationSet">
                <el-tag v-for="(tag, index) in tagNames" :key="tag.id" effect="light" :type="types[index%types.length]" class="tab_button">{{ tag.name }} </el-tag>
                <el-button size="small" icon="search" type="primary" @click="handleSelectTags">选择</el-button>
                <kbTag v-if="showTagManager" :tagsExisted="tagNames" @on-cancel="onCancelSelectTags" @on-select-tags="onSelectTags" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row type="flex" :gutter="15">
            <el-col :span="24">
              <el-form-item label="摘要">
                <el-input v-model="form.summary" type="textarea" :rows="2" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row type="flex" :gutter="15">
            <el-col :span="24">
              <el-form-item label="外部链接">
                <el-input v-model="form.url" type="url" placeholder="外部文章链接" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row type="flex" :gutter="15">
            <el-col :span="12">
              <el-form-item label="免费" prop="isFree">
                <el-radio v-for="item in dict.article_status" :key="item.id" v-model="form.price.isFree" :label="item.value" @change="onChange">{{ item.label }}</el-radio>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="价格">
                <el-input v-model="form.price.price" type="number" :disabled="form.price.isFree == 'true'" placeholder="请填写文章价格" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row type="flex" :gutter="15">
            <el-col :span="12">
              <el-form-item label="来源">
                <el-input v-model="form.source" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否有效" prop="isEffective">
                <el-radio v-for="item in dict.article_status" :key="item.id" v-model="form.isEffective" :label="item.value">{{ item.label }}</el-radio>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row type="flex" :gutter="15">
            <el-col :span="12">
              <el-form-item label="允许评论" prop="isAllowComment">
                <el-radio v-for="item in dict.article_status" :key="item.id" v-model="form.isAllowComment" :label="item.value">{{ item.label }}</el-radio>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否草稿" prop="isDraft">
                <el-radio v-for="item in dict.article_status" :key="item.id" v-model="form.isDraft" :label="item.value">{{ item.label }}</el-radio>
              </el-form-item>
            </el-col>
          </el-row>
          <wangEditor v-if="crud.status.cu > 0" :data="form.content" @handleContentAndHtml="onContent" />
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="title" label="文章标题" />
      <el-table-column prop="publishTime" label="发布时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.publishTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="isAllowComment" label="所属分类">
        <template slot-scope="scope">
          {{ handleReviewChannel(scope.row.channelSet, channels, channelName) }}
        </template>
      </el-table-column>
      <el-table-column prop="isEffective" label="是否有效">
        <template slot-scope="scope">
          {{ dict.label.article_status[scope.row.isEffective] }}
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" />
      <el-table-column prop="updateTime" label="修改时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','article:edit','article:del']" label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <udOperation :data="scope.row" :permission="permission" />
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script>
import crudArticle from '@/api/cms/article/article'
import { getChannels } from '@/api/cms/base/channel'
import { getTags } from '@/api/cms/base/tag'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import wangEditor from '@/components/wangEditor/index'
import MaterialList from '@/components/material'
import KbTag from '@/components/tag'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, title: null, subtitle: null, cover: null,
  summary: null, url: null, source: null, isAllowComment: 'true', isDraft: 'true',
  isEffective: 'true', content: null, price: { isFree: 'true', price: 0 }, tagRelationSet: null, channelSet: null }
export default {
  name: 'Article',
  components: { pagination, crudOperation, rrOperation, udOperation, wangEditor, MaterialList, KbTag },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['article_status'],
  cruds() {
    return CRUD({ title: '文章', url: 'api/article', sort: 'id,desc', crudMethod: { ...crudArticle }})
  },
  data() {
    return {
      showTagManager: false, imageArr: [], channelName: [], tagNames: [],
      channels: [], tags: [],
      // 渲染标签列表时用到
      types: ['success', 'info', 'waring', 'danger'],
      permission: {
        add: ['admin', 'article:add'],
        edit: ['admin', 'article:edit'],
        del: ['admin', 'article:del']
      },
      rules: {
        title: [
          { required: true, message: '文章标题不能为空', trigger: 'blur' }
        ],
        isAllowComment: [
          { required: true, message: '是否允许评论标识不能为空', trigger: 'blur' }
        ],
        isDraft: [
          { required: true, message: '是否草稿不能为空', trigger: 'blur' }
        ],
        isEffective: [
          { required: true, message: '是否有效不能为空', trigger: 'blur' }
        ],
        'price.price': [
          { type: 'number', message: '数字格式不正确', trigger: 'blur' }
        ]
      },
      dialogStyle: { height: '290px', overflow: 'auto', paddingRight: '15px' }
    }
  },
  watch: {
    imageArr: function(val) {
      this.form.cover = val.join(',')
    },
    'crud.status.cu': function(val) {
      if (val > 0) {
        const clientHeight = document.documentElement.clientHeight
        const marginTop = clientHeight * 0.25
        this.dialogStyle.height = (clientHeight - marginTop - 54 - 62) + 'px'
        this.tagNames = this.handleSetName(this.form.tagRelationSet, this.tags, [])
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.handleTags()
      this.handleChannels()
    })
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.afterToCU](crud, form) {
      if (form.cover && form.id) {
        this.imageArr = form.cover.split(',')
      }
      form.isEffective = `${form.isEffective}`
      form.isAllowComment = `${form.isAllowComment}`
      form.isDraft = `${form.isDraft}`
      form.price.isFree = `${form.price.isFree}`
    },
    onContent(detail, html) {
      const obj = this.form.content || {}
      obj.content = detail
      obj.html = html
      if (!this.form.content) {
        this.form.content = obj
      }
    },
    onChange(val) {
      if (val) {
        this.form.price.price = 0
      }
    },
    onCancelSelectTags() {
      this.showTagManager = false
    },
    onSelectTags(tags) {
      if (tags.length > 0) {
        this.form.tagRelationSet = tags.map(x => {
          return { tagId: x.id, name: x.name }
        })
      }
      this.showTagManager = false
    },
    handleSelectTags() {
      this.showTagManager = true
    },
    handleTags() {
      this.tags = []
      getTags().then(res => {
        this.tags = res.content
      })
    },
    handleChannels() {
      this.channels = []
      getChannels().then(res => {
        this.channels = res.content
        this.handleSetName(this.form.channelSet, this.channels, this.channelName)
      })
    },
    handleReviewChannel(arr, tree, name) {
      const o = this.handleSetName(arr, tree, name).map(x => x.name)
      return o.join(',')
    },
    handleSetName(arr, tree, name) {
      if (arr == null) { return }
      name = []
      for (let i = 0; i < arr.length; i++) {
        const el = arr[i]
        this.handleChannelAndTagReselect(name, tree, (el.tagId || el.channelId))
      }
      return name
    },
    // 处理回显
    handleChannelAndTagReselect(reselect, treeData, id) {
      treeData.some(el => {
        const xx = this.handleFindNodeName(reselect, el, id)
        return xx
      })
    },
    handleFindNodeName(map, node, id) {
      let c = false
      if (node && id) {
        if (node.id === id) {
          map.push({ id: node.id, name: node.name })
          return true
        } else {
          if (node.children && node.children.length > 0) {
            node.children.some(element => {
              c = this.handleFindNodeName(map, element, id)
              return c
            })
          } else {
            return false
          }
        }
        return c
      }
      return c
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .tab_button {
    margin-right: 5px;
    margin-bottom: 5px;
}
</style>

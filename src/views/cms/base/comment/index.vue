<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.content" clearable placeholder="输入评论内容搜索" style="width: 180px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-model="query.isPublic" clearable size="small" placeholder="是否公开" class="filter-item" style="width: 100px" @change="crud.toQuery">
          <el-option v-for="item in dict.comment_status" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
        <rrOperation :crud="crud" />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
    <!--表单组件-->
    <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="580px">
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
        <el-row type="flex" :gutter="15">
          <el-col :span="24">
            <el-form-item label="IP地址" prop="ipAddress">
              <el-input v-model="form.ipAddress" :disabled="true" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="24">
            <el-form-item label="是否公开" prop="isPublic">
              <el-radio v-for="item in dict.comment_status" :key="item.id" v-model="form.isPublic" :label="item.value">{{ item.label }}</el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="24">
            <el-form-item label="评论内容" prop="content">
              <el-input v-model="form.content" :rows="3" type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="objectId" label="评论对象">
        <template slot-scope="scope">
          <span>{{ handFindName(articles,scope.row.objectId) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="评论类型">
        <template slot-scope="scope">
          <span>{{ handFindName(typeOptions,scope.row.type) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="ipAddress" label="用户IP地址" />
      <el-table-column prop="content" label="评论内容" />
      <el-table-column prop="isPublic" label="是否公开">
        <template slot-scope="scope">
          {{ dict.label.comment_status[scope.row.isPublic] }}
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" />
      <el-table-column prop="updateTime" label="修改时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','comment:edit','comment:del']" label="操作" width="150px" align="center">
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
import { getArticleList } from '@/api/cms/article/article'
import crudComment from '@/api/cms/base/comment'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, content: null, objectId: null, type: null, userName: null, ipAddress: null, isPublic: 'true' }
export default {
  name: 'Comment',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['comment_status'],
  cruds() {
    return CRUD({ title: '评论', url: 'api/comment', sort: 'id,desc', crudMethod: { ...crudComment }})
  },
  data() {
    return {
      articles: [],
      permission: {
        add: ['admin', 'comment:add'],
        edit: ['admin', 'comment:edit'],
        del: ['admin', 'comment:del']
      },
      rules: {
        content: [
          { required: true, message: '评论内容不能为空', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '评论类型不能为空', trigger: 'blur' }
        ],
        isPublic: [
          { required: true, message: '是否公开不能为空', trigger: 'blur' }
        ]
      },
      typeOptions: [
        { id: 1, name: '文章' },
        { id: 2, name: '图片' },
        { id: 3, name: '视频' }
      ]
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.handleArticle()
      this.crud.optShow = {
        add: false,
        edit: true,
        del: true,
        download: true,
        reset: true
      }
    })
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    [CRUD.HOOK.afterToCU](crud, form) {
      form.isPublic = `${form.isPublic}`
    },
    handFindName(array, id) {
      const o = array.find(el => el.id === id)
      return o ? (o.name || o.title) : ''
    },
    handleArticle() {
      this.articles = []
      getArticleList().then(res => {
        this.articles = res.content
      })
    }
  }
}
</script>

<style scoped>
</style>

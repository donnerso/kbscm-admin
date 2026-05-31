<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--侧边部门数据-->
      <el-col :xs="9" :sm="6" :md="5" :lg="4" :xl="4">
        <div class="head-container">
          <el-input v-model="categoryName" clearable size="small" placeholder="输入部门名称搜索" prefix-icon="el-icon-search" class="filter-item" @input="getDeptDatas" />
        </div>
        <el-tree :data="categoryData" :load="getDeptDatas" :props="defaultProps" :expand-on-click-node="false" lazy @node-click="handleNodeClick" />
      </el-col>
      <!--用户数据-->
      <el-col :xs="15" :sm="18" :md="19" :lg="20" :xl="20">
        <!--工具栏-->
        <div class="head-container">
          <div v-if="crud.props.searchToggle">
            <!-- 搜索 -->
            <el-input v-model="query.name" clearable placeholder="输入物料名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
            <el-select v-model="query.state" clearable size="small" placeholder="状态" class="filter-item" style="width: 90px" @change="crud.toQuery">
              <el-option v-for="item in dict.part_status" :key="item.id" :label="item.label" :value="item.value" />
            </el-select>
            <rrOperation :crud="crud" />
          </div>
          <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
          <crudOperation :permission="permission" />
        </div>
        <!--表单组件-->
        <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="800px">
          <div :style="dialogStyle">
            <el-form ref="form" :model="form" :rules="rules" size="small" label-width="85px">
              <el-row type="flex" :gutter="15">
                <el-col :span="8">
                  <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="编号" prop="partNo">
                    <el-input v-model="form.partNo" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="简称">
                    <el-input v-model="form.shortName" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row type="flex" :gutter="15">
                <el-col :span="24">
                  <el-form-item label="物料图片">
                    <MaterialList v-model="imageArr" style="width: 400px" type="image" :num="1" :width="120" :height="120" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row type="flex" :gutter="15">
                <el-col :span="24">
                  <el-form-item label="物料分类" prop="category.id">
                    <treeselect v-model="form.category.id" :options="categories" placeholder="选择分类" style="width: 100%;" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row type="flex" :gutter="15">
                <el-col :span="8">
                  <el-form-item label="状态" prop="state">
                    <el-radio v-for="item in dict.part_status" :key="item.id" v-model="form.state" :label="item.value">{{ item.label }}</el-radio>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="外文名">
                    <el-input v-model="form.foreignName" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="规格型号">
                    <el-input v-model="form.spec" />
                  </el-form-item>
                </el-col>
              </el-row>
              <wangEditor v-if="crud.status.cu > 0" :data="form.detail" @handleContentAndHtml="onContent" />
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
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="foreignName" label="外文名称" />
          <el-table-column prop="categoryId" label="物料分类">
            <template slot-scope="scope">
              {{ scope.row.category.name }}
            </template>
          </el-table-column>
          <el-table-column prop="state" label="状态">
            <template slot-scope="scope">
              {{ dict.label.part_status[scope.row.state] }}
            </template>
          </el-table-column>
          <el-table-column prop="createBy" label="创建人" />
          <el-table-column prop="updateTime" width="135" label="修改时间">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.updateTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-permission="['admin','part:edit','part:del']" label="操作" width="150px" align="center">
            <template slot-scope="scope">
              <udOperation :data="scope.row" :permission="permission" />
            </template>
          </el-table-column>
        </el-table>
        <!--分页组件-->
        <pagination />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import crudPart from '@/api/scm/base/part'
import { getPartCategories } from '@/api/scm/base/partCategory'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import WangEditor from '@/components/wangEditor/index'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import MaterialList from '@/components/material'

const defaultForm = { id: null, partNo: null, name: null, category: { id: null }, shortName: null, foreignName: null, spec: null, image: null, state: 'true', detail: null }
export default {
  name: 'Part',
  components: { pagination, crudOperation, rrOperation, Treeselect, udOperation, WangEditor, MaterialList },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['part_status'],
  cruds() {
    return CRUD({ title: '物料', url: 'api/part', sort: 'id,desc', crudMethod: { ...crudPart }})
  },
  data() {
    return {
      categoryData: [], categoryName: '', categories: [], show: false,
      defaultProps: { children: 'children', label: 'name' }, imageArr: [],
      dialogStyle: { height: '290px', overflow: 'auto', paddingRight: '15px' },
      permission: {
        add: ['admin', 'part:add'],
        edit: ['admin', 'part:edit'],
        del: ['admin', 'part:del']
      },
      rules: {
        partNo: [
          { required: true, message: '编号不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        state: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ],
        'category.id': [
          { required: true, message: '分类不能为空或顶级类目', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    imageArr: function(val) {
      this.form.image = val.join(',')
    },
    'crud.status.cu': function(val) {
      if (val > 0) {
        const clientHeight = document.documentElement.clientHeight
        const marginTop = clientHeight * 0.25
        this.dialogStyle.height = (clientHeight - marginTop - 54 - 62) + 'px'
      }
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      this.imageArr = []
      if (form.image && form.id) {
        this.imageArr = form.image.split(',')
      }
      // 获取所有分类
      getPartCategories().then(res => {
        this.categories = []
        const dept = { id: '', label: '顶级类目', children: [] }
        dept.children = res.content
        this.categories.push(dept)
      })
      form.state = `${form.state}`
    },
    // 获取左侧部门数据
    getDeptDatas(node, resolve) {
      const params = {}
      if (typeof node !== 'object') {
        if (node) {
          params['name'] = node
        }
      } else if (node.level !== 0) {
        params['parentId'] = node.data.id
      }
      setTimeout(() => {
        getPartCategories(params).then(res => {
          if (resolve) {
            resolve(res.content)
          } else {
            this.categoryData = res.content
          }
        })
      }, 100)
    },
    // 切换分类
    handleNodeClick(data) {
      this.query.categoryId = data.id
      this.crud.toQuery()
    },
    onContent(content, html) {
      const detail = this.form.detail || {}
      detail.content = content
      detail.html = html
      if (!this.form.detail) {
        this.form.detail = detail
      }
    }
  }
}
</script>

<style lang="scss" scope>
</style>

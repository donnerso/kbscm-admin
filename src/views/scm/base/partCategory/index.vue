<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.name" clearable placeholder="输入分类名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-model="query.state" clearable size="small" placeholder="状态" class="filter-item" style="width: 90px" @change="crud.toQuery">
          <el-option v-for="item in dict.part_status" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
        <el-row type="flex" :gutter="15">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="可生产" prop="isProduced">
              <el-radio v-for="item in dict.part_status" :key="item.id" v-model="form.isProduced" :label="item.value">{{ item.label }}</el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="12">
            <el-form-item label="上级分类">
              <treeselect v-model="form.parentId" :options="categories" placeholder="选择上级分类" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="可销售" prop="isSold">
              <el-radio v-for="item in dict.part_status" :key="item.id" v-model="form.isSold" :label="item.value">{{ item.label }}</el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model.number="form.sort" :min="0" :max="80" style="width:100%" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="state">
              <el-radio v-for="item in dict.part_status" :key="item.id" v-model="form.state" :label="item.value">{{ item.label }}</el-radio>
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
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" :tree-props="{children: 'children', hasChildren: 'hasChildren'}" row-key="id" @select="crud.selectChange" @select-all="crud.selectAllChange" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="state" label="状态">
        <template slot-scope="scope">
          {{ dict.label.part_status[scope.row.state] }}
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" />
      <el-table-column prop="createTime" label="创建时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="updateBy" label="修改人" />
      <el-table-column prop="updateTime" label="修改时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','partCategory:edit','partCategory:del']" label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <udOperation :data="scope.row" :permission="permission" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import crudPartCategory from '@/api/scm/base/partCategory'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'

const defaultForm = { id: null, name: null, isProduced: 'true', isSold: 'true', state: 'true', parentId: '', sort: 1 }
export default {
  name: 'PartCategory',
  components: { Treeselect, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['part_status'],
  cruds() {
    return CRUD({ title: '物料分类', url: 'api/partCategory', sort: 'id,desc', crudMethod: { ...crudPartCategory }})
  },
  data() {
    return {
      categories: [],
      permission: {
        add: ['admin', 'partCategory:add'],
        edit: ['admin', 'partCategory:edit'],
        del: ['admin', 'partCategory:del']
      },
      rules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        isProduced: [
          { required: true, message: '可生产不能为空', trigger: 'blur' }
        ],
        isSold: [
          { required: true, message: '可销售不能为空', trigger: 'blur' }
        ],
        state: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      // 获取所有分类
      crudPartCategory.getPartCategories().then(res => {
        this.categories = []
        const dept = { id: '', label: '顶级类目', children: [] }
        dept.children = res.content
        this.categories.push(dept)
      })
      form.state = `${form.state}`
      form.isProduced = `${form.isProduced}`
      form.isSold = `${form.isSold}`
      form.parentId = form.parentId == null ? '' : form.parentId
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU](crud) {
      if (crud.form.parentId == null) {
        this.$message({
          message: '上级分类不能为空',
          type: 'warning'
        })
        return false
      }
    }
  }
}
</script>

<style scoped>
</style>

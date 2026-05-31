<template>
  <div class="app-container">
    <!--表单组件-->
    <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="480px">
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
        <el-row type="flex" :gutter="15">
          <el-col :span="24">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="24">
            <el-form-item label="状态" prop="isEffective">
              <el-radio v-for="item in dict.tag_category_status" :key="item.id" v-model="form.isEffective" :label="item.value">{{ item.label }}</el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model.number="form.sort" :min="0" style="width:100%" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11" style="margin-bottom: 10px">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>标签分类</span>
          </div>
          <!--工具栏-->
          <div class="head-container">
            <div v-if="crud.props.searchToggle">
              <!-- 搜索 -->
              <el-input v-model="query.name" clearable placeholder="输入标签分类名称搜索" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
              <el-select v-model="query.isEffective" clearable size="small" placeholder="状态" class="filter-item" style="width: 90px" @change="crud.toQuery">
                <el-option v-for="item in dict.tag_category_status" :key="item.id" :label="item.label" :value="item.value" />
              </el-select>
              <rrOperation :crud="crud" />
            </div>
            <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
            <crudOperation :permission="permission" />
          </div>
          <!--表格渲染-->
          <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" highlight-current-row style="width: 100%;" @selection-change="crud.selectionChangeHandler" @current-change="handleCurrentChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="isEffective" label="状态">
              <template slot-scope="scope">
                {{ dict.label.tag_category_status[scope.row.isEffective] }}
              </template>
            </el-table-column>
            <el-table-column prop="createBy" label="创建人" />
            <el-table-column prop="updateTime" label="修改时间">
              <template slot-scope="scope">
                <span>{{ parseTime(scope.row.updateTime) }}</span>
              </template>
            </el-table-column>
            <el-table-column v-permission="['admin','tagCategory:edit','tagCategory:del']" label="操作" width="150px" align="center">
              <template slot-scope="scope">
                <udOperation :data="scope.row" :permission="permission" />
              </template>
            </el-table-column>
          </el-table>
          <!--分页组件-->
          <pagination />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="14" :lg="13" :xl="13">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>标签</span>
          </div>
          <tag ref="tag" :permission="permission" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import checkPermission from '@/utils/permission'
import crudTagCategory from '@/api/cms/base/tagCategory'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import tag from './tag'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, name: null, isEffective: 'true', sort: 1, tags: [] }
export default {
  name: 'TagCategory',
  components: { pagination, crudOperation, rrOperation, udOperation, tag },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['tag_category_status'],
  cruds() {
    return CRUD({ title: '标签分类', url: 'api/tagCategory', sort: 'id,desc', crudMethod: { ...crudTagCategory }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'tag:add'],
        edit: ['admin', 'tag:edit'],
        del: ['admin', 'tag:del']
      },
      rules: {
        name: [
          { required: true, message: '分类名称不能为空', trigger: 'blur' }
        ],
        isEffective: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '排序不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.crud.optShow = {
        add: true,
        edit: true,
        del: true,
        download: false,
        reset: true
      }
    })
  },
  methods: {
    checkPermission,
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    [CRUD.HOOK.afterToCU](crud, form) {
      form.isEffective = `${form.isEffective}`
    },
    handleCurrentChange(val) {
      if (val) {
        this.$refs.tag.categoryName = val.name
        this.$refs.tag.categoryId = val.id
        this.$refs.tag.crud.toQuery()
      }
    }
  }
}
</script>

<style scoped>
</style>

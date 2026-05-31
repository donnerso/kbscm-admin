<template>
  <div>
    <div v-if="categoryName === ''">
      <div class="my-code">点击所属分类查看标签</div>
    </div>
    <div v-else>
      <!--工具栏-->
      <div class="head-container">
        <div v-if="crud.props.searchToggle">
          <!-- 搜索 -->
          <el-input v-model="query.name" clearable placeholder="输入标签名称搜索" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
          <rrOperation :crud="crud" />
        </div>
        <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
        <crudOperation :permission="permission" />
      </div>
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
              <el-form-item label="所属分类">
                <el-input v-model="categoryName" :disabled="true" />
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
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="categoryId" label="所属分类">
          {{ categoryName }}
        </el-table-column>
        <el-table-column prop="createBy" label="创建人" />
        <el-table-column prop="updateTime" label="修改时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-permission="['admin','tag:edit','tag:del']" label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation :data="scope.row" :permission="permission" />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudTag from '@/api/cms/base/tag'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, name: null }
export default {
  name: 'Tag',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), crud(),
    form(function() {
      return Object.assign({ tagCategoryId: this.crud.query.tagCategoryId }, defaultForm)
    })
  ],
  dicts: ['tag_status'],
  cruds() {
    return CRUD({ title: '标签', url: 'api/tag', sort: 'id,desc',
      crudMethod: { ...crudTag },
      optShow: {
        add: true,
        edit: true,
        del: true,
        download: true,
        reset: true
      },
      queryOnPresenterCreated: false
    })
  },
  data() {
    return {
      categoryName: '',
      categoryId: '',
      permission: {
        add: ['admin', 'tag:add'],
        edit: ['admin', 'tag:edit'],
        del: ['admin', 'tag:del']
      },
      rules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'name', display_name: '名称' }
      ]
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      this.crud.query.tagCategoryId = this.categoryId
      return true
    }
  }
}
</script>

<style scoped>
</style>

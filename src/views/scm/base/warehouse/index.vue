<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.name" clearable placeholder="输入仓库名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-model="query.state" clearable size="small" placeholder="状态" class="filter-item" style="width: 90px" @change="crud.toQuery">
          <el-option v-for="item in stateTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
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
          <el-col :span="23">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="23">
            <el-form-item label="地址" prop="address">
              <el-input v-model="form.address" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="12">
            <el-form-item label="状态" prop="state">
              <el-radio-group v-model="form.state">
                <el-radio v-for="item in dict.warehouse_status" :key="item.id" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="仓位管理" prop="isStockMgr">
              <el-radio-group v-model="form.isStockMgr">
                <el-radio v-for="item in dict.warehouse_status" :key="item.id" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="23">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model.number="form.sort" :min="0" :max="80" style="width: 100%" controls-position="right" />
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
      <el-table-column prop="state" label="状态">
        <template slot-scope="scope">
          {{ dict.label.warehouse_status[scope.row.state] }}
        </template>
      </el-table-column>
      <el-table-column prop="isStockMgr" label="仓位管理">
        <template slot-scope="scope">
          {{ dict.label.warehouse_status[scope.row.isStockMgr] }}
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" />
      <el-table-column prop="updateTime" width="135" label="修改时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','warehouse:edit','warehouse:del']" label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <el-button v-permission="['admin','warehouse:edit']" size="mini" type="primary" icon="el-icon-edit" plain circle @click="crud.toEdit(scope.row)" />
          <el-button v-permission="['admin','stockPlace:list']" style="margin-left: 3px" :disabled="!scope.row.isStockMgr" type="text" size="mini">
            <span v-if="!scope.row.isStockMgr">仓位</span>
            <router-link v-if="scope.row.isStockMgr" :to="'/scm/base/stock/' + scope.row.id">
              仓位
            </router-link>
          </el-button>
          <el-popover :ref="scope.row.id" v-permission="['admin','warehouse:del']" placement="top" width="200">
            <p>确定删除该数据吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="$refs[scope.row.id].doClose()">取消</el-button>
              <el-button :loading="delLoading" type="primary" size="mini" @click="delMethod(scope.row.id)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" size="mini" icon="el-icon-delete" plain circle />
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script>
import crudWarehouse from '@/api/scm/base/warehouse'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, name: null, address: null, state: 'true', isStockMgr: 'true', sort: 1 }
export default {
  name: 'Warehouse',
  components: { pagination, crudOperation, rrOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['warehouse_status'],
  cruds() {
    return CRUD({ title: '仓库', url: 'api/warehouse', sort: 'id,desc', crudMethod: { ...crudWarehouse }})
  },
  data() {
    return {
      delLoading: false,
      permission: {
        add: ['admin', 'warehouse:add'],
        edit: ['admin', 'warehouse:edit'],
        del: ['admin', 'warehouse:del']
      },
      rules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        state: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ]
      },
      stateTypeOptions: [
        { key: 'true', display_name: '启用' },
        { key: 'false', display_name: '禁用' }
      ]
    }
  },
  methods: {
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      form.state = `${form.state}`
      form.isStockMgr = `${form.isStockMgr}`
    },
    delMethod(id) {
      this.delLoading = true
      crudWarehouse.del([id]).then(() => {
        this.delLoading = false
        this.$refs[id].doClose()
        this.crud.dleChangePage(1)
        this.crud.delSuccessNotify()
        this.crud.toQuery()
      }).catch(() => {
        this.delLoading = false
        this.$refs[id].doClose()
      })
    }
  }
}
</script>

<style scoped>
</style>

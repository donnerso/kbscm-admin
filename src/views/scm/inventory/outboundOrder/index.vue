<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <el-input v-model="query.billNo" clearable placeholder="输入单据编号搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-model="query.state" clearable size="small" placeholder="状态" class="filter-item" style="width: 90px" @change="crud.toQuery">
          <el-option v-for="item in stateTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
        </el-select>
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission">
        <template slot="left">
          <el-button size="mini" type="primary" class="filter-item">
            <router-link :to="{name: 'Order', params: {}}">
              新增
            </router-link>
          </el-button>
        </template>
      </crudOperation>
    </div>
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="billNo" label="单据编号" />
      <el-table-column prop="billDate" label="单据日期">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.billDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="warehouseId" label="所属仓库">
        <template slot-scope="scope">
          <span>{{ scope.row.warehouse.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="state" label="状态">
        <template slot-scope="scope">
          {{ dict.label.outbound_order_status[scope.row.state] }}
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" />
      <el-table-column prop="updateTime" label="修改时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','outboundOrder:edit','outboundOrder:del']" label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <el-button v-permission="['admin','outboundOrder:edit']" size="mini" style="margin-right: 3px;" type="text" @click="crud.toEdit(scope.row)">
            <router-link :to="{ name:'Order', params: {data: scope.row}}">
              编辑
            </router-link>
          </el-button>
          <el-popover :ref="scope.row.id" v-permission="['admin','outboundOrder:del']" placement="top" width="200">
            <p>确定删除该数据吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="$refs[scope.row.id].doClose()">取消</el-button>
              <el-button :loading="delLoading" type="primary" size="mini" @click="delMethod(scope.row.id)">确定</el-button>
            </div>
            <el-button slot="reference" type="text" size="mini">删除</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script>
import crudOutboundOrder from '@/api/scm/inventory/outboundOrder'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, billNo: null, billDate: null, receiptType: 2, relatedBillId: null, warehouse: { id: null }, remarks: null, state: 'true' }
export default {
  name: 'OutboundOrder',
  components: { pagination, crudOperation, rrOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['outbound_order_status'],
  cruds() {
    return CRUD({ title: '生产出库', url: 'api/outboundOrder', sort: 'id,desc', crudMethod: { ...crudOutboundOrder }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'outboundOrder:add'],
        edit: ['admin', 'outboundOrder:edit'],
        del: ['admin', 'outboundOrder:del']
      },
      delLoading: false,
      rules: {
        billNo: [
          { required: true, message: '单据编号不能为空', trigger: 'blur' }
        ],
        billDate: [
          { required: true, message: '单据日期不能为空', trigger: 'blur' }
        ],
        'warehouse.id': [
          { required: true, message: '仓库不能为空', trigger: 'blur' }
        ],
        state: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ]
      },
      stateTypeOptions: [
        { key: 'true', display_name: '已审' },
        { key: 'false', display_name: '待审' }
      ]
    }
  },
  watch: {
  },
  mounted() {
    this.$nextTick(() => {
      this.crud.optShow = {
        add: false,
        edit: false,
        del: false,
        download: false,
        reset: true
      }
    })
  },
  methods: {
    delMethod(id) {
      this.delLoading = true
      crudOutboundOrder.del([id]).then(() => {
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

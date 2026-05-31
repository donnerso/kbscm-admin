<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.name" clearable placeholder="请输入供应商名称搜索" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-model="query.state" clearable size="small" placeholder="状态" class="filter-item" style="width: 90px" @change="crud.toQuery">
          <el-option v-for="item in stateTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
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
              <el-form-item label="地址">
                <el-input v-model="form.address" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="联系方式">
                <el-input v-model="form.contact" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row type="flex" :gutter="15">
            <el-col :span="8">
              <el-form-item label="国家代码">
                <el-input v-model="form.telCountryCode" placeholder="电话，国家代码" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="区号">
                <el-input v-model="form.telRegionCode" placeholder="电话，区号" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="电话号码">
                <el-input v-model="form.telephone" placeholder="电话号码" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row type="flex" :gutter="15">
            <el-col :span="8">
              <el-form-item label="状态" prop="state">
                <el-radio v-for="item in dict.supplier_status" :key="item.id" v-model="form.state" :label="item.value">{{ item.label }}</el-radio>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="传真">
                <el-input v-model="form.fax" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="企业规模">
                <el-input v-model="form.scale" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row type="flex">
            <el-col :span="12">
              <el-form-item label="公司标志">
                <MaterialList v-model="logoArr" style="width: 400px" type="image" :num="1" :width="120" :height="120" />
              </el-form-item>
            </el-col>
            <el-col :span="12">&nbsp;</el-col>
          </el-row>
          <el-row type="flex">
            <el-col :span="24">
              <el-form-item label="公司简述">
                <el-input v-model="form.summary" :rows="3" type="textarea" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row type="flex" :gutter="15">
            <el-col :span="8">
              <el-form-item label="邮政编码">
                <el-input v-model="form.postcode" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="电子邮箱" prop="email">
                <el-input v-model="form.email" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="公司网站" prop="website">
                <el-input v-model="form.website" />
              </el-form-item>
            </el-col>
          </el-row>
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
      <el-table-column prop="contact" label="联系方式" />
      <el-table-column prop="telephone" label="电话号码" />
      <el-table-column prop="state" label="状态">
        <template slot-scope="scope">
          {{ dict.label.supplier_status[scope.row.state] }}
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" />
      <el-table-column prop="updateTime" label="修改时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','supplier:edit','supplier:del']" label="操作" width="300px" align="center">
        <template slot-scope="scope">
          <el-button v-permission="['admin','supplier:edit']" size="mini" style="margin-right: 3px;" type="text" @click="crud.toEdit(scope.row)">编辑</el-button>
          <el-button v-permission="['admin','supplierAccount:list']" style="margin-left: 3px" type="text" size="mini">
            <router-link :to="'/scm/purchase/supplierAccount/' + scope.row.id">
              银行信息
            </router-link>
          </el-button>
          <el-button v-permission="['admin','supplierInvoiceInfo:list']" style="margin-left: 3px" type="text" size="mini">
            <router-link :to="'/scm/purchase/supplierInvoiceInfo/' + scope.row.id">
              开票资料
            </router-link>
          </el-button>
          <el-popover
            :ref="scope.row.id"
            v-permission="['admin','supplier:del']"
            placement="top"
            width="200"
          >
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
import crudSupplier from '@/api/scm/purchase/supplier'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import MaterialList from '@/components/material'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, name: null, logo: null, address: null, contact: null, telCountryCode: null, telRegionCode: null, telephone: null, fax: null, postcode: null, email: null, website: null, summary: null, scale: null, state: 'true' }
export default {
  name: 'Supplier',
  components: { pagination, crudOperation, rrOperation, MaterialList },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['supplier_status'],
  cruds() {
    return CRUD({ title: '供应商', url: 'api/supplier', sort: 'id,desc', crudMethod: { ...crudSupplier }})
  },
  data() {
    return {
      show: false, logoArr: [], delLoading: false,
      dialogStyle: { height: '290px', overflow: 'auto', paddingRight: '15px' },
      permission: {
        add: ['admin', 'supplier:add'],
        edit: ['admin', 'supplier:edit'],
        del: ['admin', 'supplier:del']
      },
      rules: {
        name: [
          { required: true, message: '供应商名称不能为空', trigger: 'blur' }
        ],
        state: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ],
        website: [
          { type: 'url', message: '网站格式不正确', trigger: 'blur' }
        ]
      },
      stateTypeOptions: [
        { key: 'true', display_name: '正常' },
        { key: 'false', display_name: '暂停' }
      ]
    }
  },
  watch: {
    logoArr: function(val) {
      this.form.logo = val.join(',')
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
    [CRUD.HOOK.afterToCU](curd, form) {
      this.logoArr = []
      if (form.logo && form.id) {
        this.logoArr = form.logo.split(',')
      }
      form.state = `${form.state}`
    },
    delMethod(id) {
      this.delLoading = true
      crudSupplier.del([id]).then(() => {
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

<style lang="scss" scoped>
</style>

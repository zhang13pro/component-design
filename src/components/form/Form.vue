<el-form :model="ruleForm" :rules="rules" ref="form">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="ruleForm.username"></el-input>
      <!-- <el-input :model-value="" @update:model-value=""></el-input> -->
    </el-form-item>
    <el-form-item label="密码" prop="passwd">
      <el-input type="textarea" v-model="ruleForm.passwd"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm()">登录</el-button>
    </el-form-item>
  </el-form>

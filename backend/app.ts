import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, RoleCode } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/shared/security/password.js";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL não definida.");
const prisma = new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});

async function main(){
  const company=await prisma.company.upsert({
    where:{document:"34322244000102"},update:{},
    create:{name:"DM Caffe Ltda",tradeName:"DM Caffè",document:"34322244000102"}
  });
  const store=await prisma.store.upsert({
    where:{companyId_code:{companyId:company.id,code:"JP-01"}},update:{},
    create:{companyId:company.id,name:"DM Caffè — Loja Principal",code:"JP-01"}
  });
  for(const role of [
    {code:RoleCode.ADMIN,name:"Administrador"},
    {code:RoleCode.MANAGER,name:"Gerente"},
    {code:RoleCode.CASHIER,name:"Caixa"},
    {code:RoleCode.BARISTA,name:"Barista"}
  ]){
    await prisma.role.upsert({where:{code:role.code},update:{name:role.name},create:role});
  }
  const adminRole=await prisma.role.findUniqueOrThrow({where:{code:RoleCode.ADMIN}});
  const user=await prisma.user.upsert({
    where:{companyId_email:{companyId:company.id,email:"admin@dmcaffe.com.br"}},update:{},
    create:{
      companyId:company.id,roleId:adminRole.id,name:"Luis F.",
      email:"admin@dmcaffe.com.br",passwordHash:await hashPassword("BaristaOS@123")
    }
  });
  await prisma.userStore.upsert({
    where:{userId_storeId:{userId:user.id,storeId:store.id}},update:{},
    create:{userId:user.id,storeId:store.id}
  });

  const cats=[
    {code:"CAFES",name:"Cafés",sortOrder:1},
    {code:"SALGADOS",name:"Salgados",sortOrder:2},
    {code:"DOCES",name:"Doces",sortOrder:3},
    {code:"BEBIDAS",name:"Bebidas",sortOrder:4}
  ];
  for(const category of cats){
    await prisma.category.upsert({
      where:{companyId_code:{companyId:company.id,code:category.code}},
      update:category,create:{companyId:company.id,...category}
    });
  }
  const cafes=await prisma.category.findUniqueOrThrow({where:{companyId_code:{companyId:company.id,code:"CAFES"}}});
  const salgados=await prisma.category.findUniqueOrThrow({where:{companyId_code:{companyId:company.id,code:"SALGADOS"}}});
  for(const p of [
    {code:"1001",name:"Espresso",categoryId:cafes.id,price:"5.00",aliases:["expresso","cafe curto"],favorite:true},
    {code:"1003",name:"Cappuccino",categoryId:cafes.id,price:"9.00",aliases:["cap","capp"],favorite:true},
    {code:"2001",name:"Pão de Queijo",categoryId:salgados.id,price:"7.00",aliases:["pq","pao","queijo"],favorite:true},
    {code:"2002",name:"Croissant",categoryId:salgados.id,price:"14.00",aliases:["croa"],favorite:true}
  ]){
    await prisma.product.upsert({
      where:{companyId_code:{companyId:company.id,code:p.code}},
      update:p,create:{companyId:company.id,...p}
    });
  }
  for(let number=1;number<=16;number++){
    await prisma.cafeTable.upsert({
      where:{storeId_number:{storeId:store.id,number}},update:{},
      create:{storeId:store.id,number,seats:4}
    });
  }
  console.log("Seed concluído.");
  console.log("Login: admin@dmcaffe.com.br");
  console.log("Senha: BaristaOS@123");
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>prisma.$disconnect());

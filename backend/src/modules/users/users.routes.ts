import type { FastifyPluginAsync } from "fastify";
export const usersRoutes: FastifyPluginAsync = async app => {
  app.get("/me",{preHandler:app.authenticate},async request => {
    const user=await app.prisma.user.findUnique({
      where:{id:request.user.sub},
      select:{
        id:true,name:true,email:true,status:true,lastLoginAt:true,
        company:{select:{id:true,name:true,tradeName:true}},
        role:{select:{code:true,name:true}},
        stores:{select:{store:{select:{id:true,name:true,code:true,active:true}}}}
      }
    });
    return {...user,currentStoreId:request.user.storeId};
  });
};

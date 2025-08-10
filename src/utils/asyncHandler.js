const asyncHandler = (reqestHandler) => {
  async (req, res, next) => {
    try {
      await reqestHandler(req, res, next);
    } catch (err) {
      res.status(err.code || 500).json({
        success: false,
        message: err.message,
      });
    }
  };
};

/*
    Second method using Promises instead of tryCatch
const asyncHandler = (reqestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(reqestHandler(req,res.next)).catch((err)=>{
            console.log("ERROR: ",err);
            next(err)
        })
    }

}*/

export { asyncHandler };

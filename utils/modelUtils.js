/**
 * CreatNewEntity
 * @param {object} fields 
 * @param {object} model 
 * @return {object} entity
 */
 export function createNewEntity(fields, model) {
    const entity = new model();
    const modelFields = Object.keys(model.schema.paths);
    const entityFields = Object.keys(fields);
  
    entityFields.forEach(field => {
      if (modelFields.indexOf(field) > -1) {
        entity[field] = fields[field];
      }
    });
  
    return entity;
  }
  
  /**
   * MergeEntity
   * @param {object} fields 
   * @param {object} model 
   * @return {object} entity
   */
  export function mergeEntity(fields, model) {
    const entity = {};
    const modelFields = Object.keys(model.schema.paths);
    const entityFields = Object.keys(fields);
  
    entityFields.forEach(field => {
      if (modelFields.indexOf(field) > -1) {
        entity[field] = fields[field];
      }
    });
  
    return entity;
  }
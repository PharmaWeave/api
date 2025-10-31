import { AppDataSource } from "@/database/data-source";
import { Template } from "../models/template";
import { StatusEnum } from "@/database/base-entity";

class TemplateService {

    static async getByKey(key: string) {
        const TemplateRepository = AppDataSource.getRepository(Template);

        return await TemplateRepository.findOne({
            where: {
                key: key,
                status: StatusEnum.ACTIVE
            }
        });
    }

    static format(template: string, params: { key: string; value: string; }[]) {
        params.forEach(param => {
            template = template.replace("${" + param.key + "}", param.value);
        });

        return template;
    }
}

export default TemplateService;

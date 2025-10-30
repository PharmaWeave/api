import { z } from "zod";

import { StatusEnum } from "@/database/base-entity";

export const StatusTypeValidator = z.enum(Object.values(StatusEnum));

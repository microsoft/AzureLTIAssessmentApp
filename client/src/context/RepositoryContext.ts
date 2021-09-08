import React from "react";
import { IRepository } from "../model/IRepository";

export const RepositoryContext = React.createContext<IRepository | null>(null);

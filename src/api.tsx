import axios from "axios";

type ResourceType = "image" | "video" | "raw";

const Api = {
  async updateTourGraph(id: string, graph: TourGraph) {
    try {
      const { data } = await axios.post("/tour", { ...graph, _id: id });
    } catch (err) {
      console.error(err);
      return graph;
    }
  },

  async findDepth(url: string): Promise<number[][] | undefined> {
    try {
      const { data } = await axios.get(
        "http://127.0.0.1:5000/depth?url=" + url
      );
      return data.data as number[][];
    } catch (err) {
      console.error(err);
    }
  },

  async getTours(): Promise<{ [id: string]: TourGraph }> {
    try {
      const { data } = await axios.get("http://127.0.0.1:5000/tour");
      return data as { [id: string]: TourGraph };
    } catch (err) {
      console.error(err);
      return {};
    }
  },

  async addImage(file: File): Promise<string> {
    const fileWrapper = new FormData();
    fileWrapper.append("image", file);
    try {
      const { data } = await axios.post("/upload-image", fileWrapper, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data as string;
    } catch (err) {
      console.error(err);
      return "";
    }
  },

  async addResource(resource: File, type: ResourceType): Promise<string> {
    const fileWrapper = new FormData();
    fileWrapper.append(type, resource);
    try {
      const { data } = await axios.post("/upload-resource", fileWrapper, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data as string;
    } catch (err) {
      console.error(err);
      return "";
    }
  },
};

export default Api;
